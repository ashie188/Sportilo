import pool from "../config/db.js";
import chatSupabase from "../config/chatSupabase.js";
import generateChatToken from "../Jwt_utils/generateChatToken.js";
import generateChatReadToken from "../Jwt_utils/generateChatReadToken.js";

const ALLOWED_ENVIRONMENTS = new Set(["local", "production"]);
const ALLOWED_MATCH_TYPES = new Set(["offline", "gaming"]);

const WRITE_TOKEN_EXPIRY = 3600;
const READ_TOKEN_EXPIRY = 600;

/*
 * Validate and normalize the chat request parameters.
 *
 * Returns:
 * {
 *   type,
 *   matchId
 * }
 */
const validateChatParams = (type, id) => {
  if (!ALLOWED_MATCH_TYPES.has(type)) {
    return {
      error: {
        status: 400,
        message: "Invalid match type.",
      },
    };
  }

  const matchId = Number(id);

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return {
      error: {
        status: 400,
        message: "Invalid match ID.",
      },
    };
  }

  return {
    type,
    matchId,
  };
};

/*
 * Validate the configured chat environment once
 * per request.
 */
const getChatEnvironment = () => {
  const environment = process.env.CHAT_ENVIRONMENT;

  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    return null;
  }

  return environment;
};

/*
 * Check whether the requested match exists and return
 * the host email when needed.
 */
const getMatch = async (type, matchId) => {
  const query =
    type === "offline"
      ? `
          SELECT id, admin_email
          FROM matches
          WHERE id = $1
          LIMIT 1
        `
      : `
          SELECT id, admin_email
          FROM gaming_groups
          WHERE id = $1
          LIMIT 1
        `;

  const result = await pool.query(query, [matchId]);

  return result.rows[0] || null;
};

/*
 * Check whether the user has been synchronized into
 * the chat participant table.
 *
 * chat_participants lives in the Chat Supabase project,
 * not the main Sportilo PostgreSQL database.
 */
const isChatParticipant = async ({ environment, type, matchId, userId }) => {
  let query = chatSupabase
    .from("chat_participants")
    .select("id")
    .eq("environment", environment)
    .eq("user_id", userId)
    .limit(1);

  query =
    type === "offline"
      ? query.eq("match_id", matchId)
      : query.eq("gaming_match_id", matchId);

  const { data, error } = await query;

  if (error) {
    console.error("Chat participant lookup failed:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    throw new Error("CHAT_PARTICIPANT_LOOKUP_FAILED");
  }

  return Array.isArray(data) && data.length > 0;
};

/*
 * GET /chat/access/:type/:id
 *
 * Returns a short-lived authenticated Chat JWT.
 *
 * Authorization:
 *   - Match host
 *   OR
 *   - Joined chat participant
 */
export const getChatAccessToken = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const userEmail = req.user?.email;

    if (!Number.isInteger(userId) || userId <= 0 || !userEmail) {
      return res.status(401).json({
        message: "Please login to send messages.",
      });
    }

    const environment = getChatEnvironment();

    if (!environment) {
      console.error("Invalid CHAT_ENVIRONMENT configuration.");

      return res.status(500).json({
        message: "Chat service is temporarily unavailable.",
      });
    }

    const { type, matchId, error } = validateChatParams(
      req.params.type,
      req.params.id,
    );

    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    /*
     * Verify that the match exists in the main
     * Sportilo database.
     */
    const match = await getMatch(type, matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found.",
      });
    }

    /*
     * The host automatically has chat access.
     */
    const isHost = match.admin_email === userEmail;

    /*
     * Non-host users must exist in chat_participants.
     */
    const isParticipant = isHost
      ? false
      : await isChatParticipant({
          environment,
          type,
          matchId,
          userId,
        });

    /*
     * Only hosts and joined participants can send.
     */
    if (!isHost && !isParticipant) {
      return res.status(403).json({
        message: "Join the match before sending messages.",
      });
    }

    /*
     * Generate the short-lived authenticated
     * Supabase Chat JWT.
     */
    const token = await generateChatToken(userId);

    return res.status(200).json({
      token,
      expiresIn: WRITE_TOKEN_EXPIRY,
    });
  } catch (error) {
    if (error?.message === "CHAT_PARTICIPANT_LOOKUP_FAILED") {
      return res.status(500).json({
        message: "Unable to authorize chat.",
      });
    }

    console.error("Chat write authorization failed:", error);

    return res.status(500).json({
      message: "Unable to authorize chat.",
    });
  }
};

/*
 * GET /chat/view/:type/:id
 *
 * Returns a short-lived read-only Chat JWT.
 *
 * Current product behavior:
 * Anyone who can access an existing match can view
 * that match's chat.
 */
export const getChatReadAccessToken = async (req, res) => {
  try {
    const { type, matchId, error } = validateChatParams(
      req.params.type,
      req.params.id,
    );

    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    /*
     * Verify that the match exists in the main
     * Sportilo database before issuing a read token.
     */
    const match = await getMatch(type, matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found.",
      });
    }

    /*
     * Generate a read-only token bound to this
     * specific match.
     */
    const token = await generateChatReadToken(type, matchId);

    return res.status(200).json({
      token,
      expiresIn: READ_TOKEN_EXPIRY,
    });
  } catch (error) {
    console.error("Chat read authorization failed:", error);

    return res.status(500).json({
      message: "Unable to authorize chat viewing.",
    });
  }
};
