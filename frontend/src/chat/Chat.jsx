import { useCallback, useEffect, useRef, useState } from "react";

import { useChat } from "./useChat.js";
import "./Chat.css";

const MAX_MESSAGE_LENGTH = 500;

const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser);

    if (!parsedUser || typeof parsedUser !== "object") {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
};

const getUserId = (user) => {
  const numericUserId = Number(user?.id);

  return Number.isInteger(numericUserId) && numericUserId > 0
    ? numericUserId
    : null;
};

const formatMessageTime = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chat = ({ matchType, matchId }) => {
  /*
   * Read the current user when the component mounts.
   *
   * Chat authorization itself is handled by the backend,
   * so this value is only used by the UI to determine:
   * - whether the user can see the input
   * - whether a message belongs to the current user
   */
  const [user, setUser] = useState(getCurrentUser);

  const userId = getUserId(user);

  const {
    messages,
    isLoading,
    isSending,
    isConnected,
    error,
    sendMessage,
    clearError,
  } = useChat({
    matchType,
    matchId,
    userId,
  });

  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const previousMessageCountRef = useRef(0);

  /*
   * Keep the local user state synchronized with
   * login/logout events in other parts of the app.
   *
   * The custom event can be dispatched by the auth
   * flow when the user logs in or logs out.
   */
  useEffect(() => {
    const syncUser = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("sportilo-auth-change", syncUser);

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("sportilo-auth-change", syncUser);

      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /*
   * Scroll to the newest message when messages change.
   *
   * block: "nearest" prevents unnecessarily moving
   * the whole page.
   */
  useEffect(() => {
    const previousCount = previousMessageCountRef.current;

    if (messages.length > previousCount) {
      messagesEndRef.current?.scrollIntoView({
        behavior: previousCount === 0 ? "auto" : "smooth",
        block: "nearest",
      });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  /*
   * Clear the input when switching to another match.
   */
  useEffect(() => {
    setMessageInput("");
    previousMessageCountRef.current = 0;
  }, [matchType, matchId]);

  const handleInputChange = useCallback(
    (event) => {
      const value = event.target.value;

      if (value.length > MAX_MESSAGE_LENGTH) {
        return;
      }

      setMessageInput(value);

      /*
       * Remove an old error as soon as the user
       * starts typing a new message.
       */
      if (error) {
        clearError();
      }
    },
    [error, clearError],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isSending) {
        return;
      }

      const message = messageInput.trim();

      if (!message) {
        return;
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        return;
      }

      const sent = await sendMessage(message);

      if (!sent) {
        return;
      }

      setMessageInput("");

      /*
       * Keep the input ready for the next message.
       */
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [isSending, messageInput, sendMessage],
  );

  const handleKeyDown = useCallback((event) => {
    /*
     * Enter sends.
     *
     * Shift + Enter creates a newline.
     */
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  }, []);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  const canSend = Boolean(userId);

  return (
    <section className="chat" aria-label="Match chat">
      <header className="chat-header">
        <div className="chat-header-content">
          <h2>Match Chat</h2>

          <span
            className={`chat-status ${
              isConnected ? "chat-status-online" : "chat-status-offline"
            }`}
            aria-live="polite"
          >
            <span className="chat-status-dot" aria-hidden="true" />

            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>
      </header>

      <div
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat messages"
      >
        {isLoading ? (
          <div className="chat-state" role="status">
            <strong>Loading messages...</strong>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-state">
            <strong>No messages yet</strong>

            <span>
              {canSend ? "Start the conversation." : "Login to start chatting."}
            </span>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = Number(message.user_id) === userId;

            return (
              <article
                key={message.id}
                className={`chat-message ${
                  isOwnMessage ? "chat-message-own" : "chat-message-other"
                }`}
              >
                <div className="chat-message-bubble">
                  <p>{message.message}</p>

                  {message.created_at && (
                    <time
                      dateTime={message.created_at}
                      title={new Date(message.created_at).toLocaleString()}
                    >
                      {formatMessageTime(message.created_at)}
                    </time>
                  )}
                </div>
              </article>
            );
          })
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {error && (
        <div className="chat-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleClearError}
            aria-label="Dismiss chat error"
          >
            ×
          </button>
        </div>
      )}

      {canSend ? (
        <form className="chat-input-form" onSubmit={handleSubmit} noValidate>
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isSending ? "Sending..." : "Type a message..."}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={isSending}
              autoComplete="off"
              spellCheck="true"
              aria-label="Message"
              aria-describedby="chat-character-count"
            />

            <button
              type="submit"
              disabled={isSending || !messageInput.trim()}
              aria-label="Send message"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>

          <span
            id="chat-character-count"
            className={`chat-character-count ${
              messageInput.length >= MAX_MESSAGE_LENGTH
                ? "chat-character-count-limit"
                : ""
            }`}
            aria-live="polite"
          >
            {messageInput.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </form>
      ) : (
        <div className="chat-login-prompt">
          <span>Login to start chatting.</span>
        </div>
      )}
      <p className="chat-privacy-note">
        Messages are visible to everyone. Don't share sensitive info.
      </p>
    </section>
  );
};

export default Chat;
