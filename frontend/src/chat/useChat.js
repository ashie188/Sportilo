import { useCallback, useEffect, useRef, useState } from "react";

import { createChatClient, setChatRealtimeAuth } from "./chatSupabase.js";

import { getChatReadAccessToken } from "./chatTokenManager.js";

import {
  fetchChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
} from "./chatService.js";

const MAX_MESSAGES = 100;

/*
 * Read tokens currently expire after 10 minutes
 * on the backend.
 *
 * Refresh before expiry so a user who keeps the
 * match open for a long time doesn't lose Realtime
 * authentication.
 */
const READ_TOKEN_REFRESH_INTERVAL = 8 * 60 * 1000;

const VALID_MATCH_TYPES = new Set(["offline", "gaming"]);

const normalizeMatchId = (matchId) => {
  const numericMatchId = Number(matchId);

  if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
    return null;
  }

  return numericMatchId;
};

const mergeMessages = (existing, incoming) => {
  const messageMap = new Map();

  for (const message of [...existing, ...incoming]) {
    if (!message?.id) {
      continue;
    }

    messageMap.set(String(message.id), message);
  }

  return Array.from(messageMap.values())
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .slice(-MAX_MESSAGES);
};

export const useChat = ({ matchType, matchId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const subscriptionRef = useRef(null);
  const mountedRef = useRef(true);
  const sendLockRef = useRef(false);

  const addMessage = useCallback((message) => {
    if (!message?.id || !mountedRef.current) {
      return;
    }

    setMessages((currentMessages) => mergeMessages(currentMessages, [message]));
  }, []);

  /*
   * Track component mount state.
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const numericMatchId = normalizeMatchId(matchId);

    if (!VALID_MATCH_TYPES.has(matchType) || numericMatchId === null) {
      setMessages([]);
      setIsLoading(false);
      setIsConnected(false);
      setError("Unable to load this match chat.");

      return;
    }

    let cancelled = false;
    let refreshTimer = null;
    let activeSubscription = null;

    const initializeChat = async () => {
      setIsLoading(true);
      setIsConnected(false);
      setError(null);
      setMessages([]);

      try {
        const client = createChatClient();

        /*
         * Get a short-lived read-only JWT.
         *
         * This token allows the current match chat
         * to be read without granting write access.
         */
        const readToken = await getChatReadAccessToken(
          matchType,
          numericMatchId,
        );

        if (cancelled) {
          return;
        }

        await setChatRealtimeAuth(readToken);

        if (cancelled) {
          return;
        }

        /*
         * Subscribe BEFORE fetching history.
         *
         * This prevents a message sent during the
         * history request from being missed.
         */
        activeSubscription = await subscribeToChatMessages(
          client,
          matchType,
          numericMatchId,
          addMessage,
          (subscriptionError) => {
            if (cancelled || !mountedRef.current) {
              return;
            }

            console.error("Chat realtime error:", subscriptionError);

            setIsConnected(false);

            setError("Live chat connection was interrupted. Reconnecting...");
          },
          (status) => {
            if (cancelled || !mountedRef.current) {
              return;
            }

            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setError(null);

              return;
            }

            if (status === "CHANNEL_ERROR" || status === "CLOSED") {
              setIsConnected(false);
            }
          },
        );

        if (cancelled) {
          await activeSubscription.unsubscribe();
          return;
        }

        subscriptionRef.current = activeSubscription;

        /*
         * Fetch existing messages after the
         * Realtime subscription is active.
         */
        const initialMessages = await fetchChatMessages(
          matchType,
          numericMatchId,
          MAX_MESSAGES,
        );

        if (cancelled || !mountedRef.current) {
          return;
        }

        setMessages((currentMessages) =>
          mergeMessages(initialMessages, currentMessages),
        );

        setIsLoading(false);

        /*
         * Refresh the read JWT before its 10-minute
         * backend expiry.
         *
         * We do not recreate the channel; we simply
         * update the Realtime authentication token.
         */
        refreshTimer = window.setInterval(async () => {
          if (cancelled || !mountedRef.current) {
            return;
          }

          try {
            const refreshedToken = await getChatReadAccessToken(
              matchType,
              numericMatchId,
              true,
            );

            if (cancelled || !mountedRef.current) {
              return;
            }

            await setChatRealtimeAuth(refreshedToken);
          } catch (refreshError) {
            if (cancelled || !mountedRef.current) {
              return;
            }

            console.error("Chat read token refresh failed:", refreshError);

            setIsConnected(false);

            setError("Chat connection expired. Please refresh the page.");
          }
        }, READ_TOKEN_REFRESH_INTERVAL);
      } catch (initializationError) {
        if (cancelled || !mountedRef.current) {
          return;
        }

        console.error("Failed to initialize chat:", initializationError);

        setMessages([]);
        setIsLoading(false);
        setIsConnected(false);

        if (initializationError?.status === 404) {
          setError("Match not found.");
        } else {
          setError(initializationError?.message || "Unable to load chat.");
        }
      }
    };

    initializeChat();

    return () => {
      cancelled = true;

      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }

      const subscription = subscriptionRef.current || activeSubscription;

      subscriptionRef.current = null;

      if (subscription) {
        subscription.unsubscribe().catch((cleanupError) => {
          console.error("Chat cleanup failed:", cleanupError);
        });
      }
    };
  }, [matchType, matchId, addMessage]);

  const sendMessage = useCallback(
    async (message) => {
      /*
       * Prevent double-clicks and duplicate submits.
       */
      if (sendLockRef.current) {
        return false;
      }

      const numericUserId = Number(userId);

      if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
        setError("Please login to start chatting.");

        return false;
      }

      const trimmedMessage = typeof message === "string" ? message.trim() : "";

      if (!trimmedMessage) {
        return false;
      }

      sendLockRef.current = true;
      setIsSending(true);
      setError(null);

      try {
        await sendChatMessage(
          matchType,
          matchId,
          numericUserId,
          trimmedMessage,
        );

        /*
         * Do NOT manually append the message.
         *
         * The successful INSERT is delivered through
         * Supabase Realtime and addMessage() handles it.
         */
        return true;
      } catch (sendError) {
        console.error("Chat send error:", sendError);

        if (sendError?.status === 401) {
          setError("Your login session expired. Please login again.");
        } else if (sendError?.status === 403) {
          setError("Join the match to send messages.");
        } else if (sendError?.code === "42501") {
          setError("You are not authorized to send messages in this match.");
        } else {
          setError(
            sendError?.message || "Unable to send message. Please try again.",
          );
        }

        return false;
      } finally {
        sendLockRef.current = false;

        if (mountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [matchType, matchId, userId],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    isConnected,
    error,
    sendMessage,
    clearError,
  };
};
