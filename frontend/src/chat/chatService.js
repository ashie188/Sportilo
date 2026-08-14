import {
  getChatAccessToken,
  getChatReadAccessToken,
} from "./chatTokenManager.js";

const CHAT_ENVIRONMENT = import.meta.env.VITE_CHAT_ENVIRONMENT;
const CHAT_SUPABASE_URL = import.meta.env.VITE_CHAT_SUPABASE_URL;
const CHAT_SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_CHAT_SUPABASE_PUBLISHABLE_KEY;

const MAX_MESSAGE_LENGTH = 500;
const MAX_FETCH_LIMIT = 100;

const REQUEST_TIMEOUT = 15_000;

if (!["local", "production"].includes(CHAT_ENVIRONMENT)) {
  throw new Error("VITE_CHAT_ENVIRONMENT must be local or production");
}

if (!CHAT_SUPABASE_URL) {
  throw new Error("VITE_CHAT_SUPABASE_URL is not configured");
}

if (!CHAT_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("VITE_CHAT_SUPABASE_PUBLISHABLE_KEY is not configured");
}

const MESSAGE_SELECT =
  "id,environment,match_id,gaming_match_id,user_id,message,created_at";

const validateMatch = (matchType, matchId) => {
  if (matchType !== "offline" && matchType !== "gaming") {
    throw new Error("Invalid chat match type");
  }

  const numericMatchId = Number(matchId);

  if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
    throw new Error("Invalid chat match ID");
  }

  return numericMatchId;
};

const getMatchColumn = (matchType) => {
  return matchType === "offline" ? "match_id" : "gaming_match_id";
};

const createTimeoutController = () => {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  return {
    signal: controller.signal,

    clear: () => {
      window.clearTimeout(timeoutId);
    },
  };
};

const parseResponseBody = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const createRequestError = (message, status = null, body = null) => {
  const error = new Error(message);

  if (status !== null) {
    error.status = status;
  }

  if (body) {
    error.code = body.code;
    error.details = body.details;
    error.hint = body.hint;
    error.body = body;
  }

  return error;
};

const fetchJson = async (url, options = {}) => {
  const timeout = createTimeoutController();

  try {
    return await fetch(url, {
      ...options,
      signal: timeout.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Chat request timed out. Please check your connection and try again.",
      );
    }

    if (!navigator.onLine) {
      throw new Error(
        "You appear to be offline. Please check your internet connection.",
      );
    }

    throw new Error("Unable to connect to chat. Please try again.");
  } finally {
    timeout.clear();
  }
};

const buildMessagePayload = (matchType, matchId, userId, message) => {
  if (matchType === "offline") {
    return {
      environment: CHAT_ENVIRONMENT,
      match_id: matchId,
      gaming_match_id: null,
      user_id: userId,
      message,
    };
  }

  return {
    environment: CHAT_ENVIRONMENT,
    match_id: null,
    gaming_match_id: matchId,
    user_id: userId,
    message,
  };
};

export const fetchChatMessages = async (matchType, matchId, limit = 100) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const safeLimit = Math.min(
    Math.max(Number(limit) || MAX_FETCH_LIMIT, 1),
    MAX_FETCH_LIMIT,
  );

  const matchColumn = getMatchColumn(matchType);

  let readToken;

  try {
    readToken = await getChatReadAccessToken(matchType, numericMatchId);
  } catch (error) {
    if (error?.status === 404) {
      throw new Error("Match not found.");
    }

    throw new Error(error?.message || "Unable to load chat.");
  }

  const params = new URLSearchParams();

  params.set("select", MESSAGE_SELECT);
  params.set("environment", `eq.${CHAT_ENVIRONMENT}`);
  params.set(matchColumn, `eq.${numericMatchId}`);
  params.set("order", "created_at.desc");
  params.set("limit", String(safeLimit));

  const response = await fetchJson(
    `${CHAT_SUPABASE_URL}/rest/v1/chat_messages?${params.toString()}`,
    {
      method: "GET",
      headers: {
        apikey: CHAT_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${readToken}`,
      },
    },
  );

  const data = await parseResponseBody(response);

  if (!response.ok) {
    console.error("Chat history request failed:", {
      status: response.status,
      body: data,
    });

    if (response.status === 401) {
      throw new Error("Your chat session expired. Please refresh the page.");
    }

    if (response.status === 404) {
      throw new Error("Match not found.");
    }

    throw createRequestError(
      data?.message || "Unable to load chat messages.",
      response.status,
      data,
    );
  }

  if (!Array.isArray(data)) {
    throw new Error("Chat returned an invalid message response.");
  }

  /*
   * Supabase returns newest first because of
   * created_at.desc. Reverse it so the UI receives
   * chronological order.
   */
  return data.reverse();
};

export const sendChatMessage = async (matchType, matchId, userId, message) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Please login to send messages.");
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    throw new Error("Message cannot be empty.");
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
  }

  let token;

  try {
    /*
     * Always request a fresh write authorization.
     *
     * The backend verifies that the current user
     * is the host or an actual chat participant.
     */
    token = await getChatAccessToken(matchType, numericMatchId, true);
  } catch (error) {
    console.error("Chat write authorization failed:", {
      status: error?.status,
      message: error?.message,
    });

    if (error?.status === 401) {
      throw new Error("Your login session has expired. Please login again.");
    }

    if (error?.status === 403) {
      throw new Error("Join the match to send messages.");
    }

    throw new Error(
      error?.message || "Unable to authorize chat. Please try again.",
    );
  }

  if (typeof token !== "string" || !token) {
    throw new Error("Unable to authorize chat. Please try again.");
  }

  const payload = buildMessagePayload(
    matchType,
    numericMatchId,
    numericUserId,
    trimmedMessage,
  );

  const response = await fetchJson(
    `${CHAT_SUPABASE_URL}/rest/v1/chat_messages`,
    {
      method: "POST",

      headers: {
        apikey: CHAT_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",

        /*
         * We don't need the inserted row here.
         *
         * Realtime is responsible for delivering the
         * inserted message to the UI.
         */
        Prefer: "return=minimal",
      },

      body: JSON.stringify(payload),
    },
  );

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    console.error("Chat message insert failed:", {
      status: response.status,
      code: responseBody?.code,
      message: responseBody?.message,
    });

    /*
     * 42501 is Supabase/PostgreSQL RLS rejection.
     */
    if (responseBody?.code === "42501" || response.status === 403) {
      const authorizationError = new Error(
        "You are not authorized to send messages in this match.",
      );

      authorizationError.status = response.status;
      authorizationError.code = responseBody?.code;
      authorizationError.details = responseBody?.details;
      authorizationError.hint = responseBody?.hint;

      throw authorizationError;
    }

    if (response.status === 401) {
      const authenticationError = new Error(
        "Your chat session expired. Please try again.",
      );

      authenticationError.status = 401;

      throw authenticationError;
    }

    throw createRequestError(
      responseBody?.message || "Unable to send message. Please try again.",
      response.status,
      responseBody,
    );
  }

  /*
   * return=minimal intentionally means there may be
   * no response body. A successful HTTP response is
   * therefore the successful send result.
   */
  return true;
};

export const subscribeToChatMessages = async (
  chatClient,
  matchType,
  matchId,
  onMessage,
  onError,
  onStatus,
) => {
  if (!chatClient) {
    throw new Error("Chat client is not available.");
  }

  const numericMatchId = validateMatch(matchType, matchId);

  const matchColumn = getMatchColumn(matchType);

  const channelName = `chat:${CHAT_ENVIRONMENT}:${matchType}:${numericMatchId}`;

  /*
   * Prevent duplicate subscriptions during:
   * - React development/HMR
   * - match changes
   * - component remounts
   */
  const existingChannel = chatClient
    .getChannels()
    .find((channel) => channel.topic === `realtime:${channelName}`);

  if (existingChannel) {
    await chatClient.removeChannel(existingChannel);
  }

  const channel = chatClient.channel(channelName).on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "chat_messages",
      filter: `${matchColumn}=eq.${numericMatchId}`,
    },
    (payload) => {
      const newMessage = payload?.new;

      if (!newMessage) {
        return;
      }

      if (newMessage.environment !== CHAT_ENVIRONMENT) {
        return;
      }

      const messageMatchId =
        matchType === "offline"
          ? Number(newMessage.match_id)
          : Number(newMessage.gaming_match_id);

      if (messageMatchId !== numericMatchId) {
        return;
      }

      onMessage?.(newMessage);
    },
  );

  return new Promise((resolve, reject) => {
    let settled = false;

    channel.subscribe((status, error) => {
      onStatus?.(status);

      if (status === "SUBSCRIBED") {
        settled = true;

        resolve({
          unsubscribe: async () => {
            try {
              await chatClient.removeChannel(channel);
            } catch (cleanupError) {
              console.error("Failed to remove chat channel:", cleanupError);
            }
          },
        });

        return;
      }

      if (status === "CHANNEL_ERROR" && !settled) {
        const subscriptionError =
          error || new Error("Chat connection could not be established.");

        console.error("Chat Realtime channel error:", subscriptionError);

        onError?.(subscriptionError);

        settled = true;
        reject(subscriptionError);

        return;
      }

      if (status === "TIMED_OUT" && !settled) {
        const timeoutError = new Error("Chat connection timed out.");

        console.error("Chat Realtime subscription timed out.");

        onError?.(timeoutError);

        settled = true;
        reject(timeoutError);

        return;
      }

      if (status === "CLOSED") {
        onStatus?.("CLOSED");
      }
    });
  });
};
