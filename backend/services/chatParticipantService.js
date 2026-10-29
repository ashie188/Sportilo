import chatSupabase from "../config/chatSupabase.js";

const ALLOWED_ENVIRONMENTS = new Set(["local", "production"]);

const validateUserId = (userId) => {
  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Invalid user ID");
  }

  return numericUserId;
};

const validateMatchId = (matchId, fieldName) => {
  if (matchId === null || matchId === undefined) {
    return null;
  }

  const numericMatchId = Number(matchId);

  if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return numericMatchId;
};

const getChatEnvironment = () => {
  const environment = process.env.CHAT_ENVIRONMENT;

  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    throw new Error("Invalid chat environment configuration");
  }

  return environment;
};

/**
 * Add a user to the chat participant list for a match.
 *
 * Exactly one match type must be provided:
 *
 * - matchId        → offline match
 * - gamingMatchId  → gaming match
 *
 * The operation is idempotent. Calling this function multiple
 * times for the same participant does not create duplicates.
 */

export const addChatParticipant = async ({
  userId,
  matchId = null,
  gamingMatchId = null,
}) => {
  const numericUserId = validateUserId(userId);

  const environment = getChatEnvironment();

  const numericMatchId = validateMatchId(matchId, "match ID");

  const numericGamingMatchId = validateMatchId(
    gamingMatchId,
    "gaming match ID",
  );

  const hasOfflineMatch = numericMatchId !== null;
  const hasGamingMatch = numericGamingMatchId !== null;

  /*
   * A participant must belong to exactly one type of match.
   */
  if (hasOfflineMatch === hasGamingMatch) {
    throw new Error("Exactly one match type is required");
  }

  const participant = {
    environment,
    user_id: numericUserId,

    match_id: hasOfflineMatch ? numericMatchId : null,

    gaming_match_id: hasGamingMatch ? numericGamingMatchId : null,
  };

  const conflictTarget = hasOfflineMatch
    ? "environment,match_id,user_id"
    : "environment,gaming_match_id,user_id";

  const { error } = await chatSupabase
    .from("chat_participants")
    .upsert(participant, {
      onConflict: conflictTarget,
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("Chat participant sync failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: numericUserId,
      environment,
      matchId: numericMatchId,
      gamingMatchId: numericGamingMatchId,
    });

    throw new Error("Unable to sync chat participant");
  }
};

/**
 * Remove a user from the chat participant list for a match.
 *
 * Exactly one match type must be provided:
 *
 * - matchId        → offline match
 * - gamingMatchId  → gaming match
 *
 * The operation is idempotent. If the participant is already
 * absent from the chat participant list, the operation succeeds.
 */
export const removeChatParticipant = async ({
  userId,
  matchId = null,
  gamingMatchId = null,
}) => {
  const numericUserId = validateUserId(userId);

  const environment = getChatEnvironment();

  const numericMatchId = validateMatchId(matchId, "match ID");

  const numericGamingMatchId = validateMatchId(
    gamingMatchId,
    "gaming match ID",
  );

  const hasOfflineMatch = numericMatchId !== null;
  const hasGamingMatch = numericGamingMatchId !== null;

  if (hasOfflineMatch === hasGamingMatch) {
    throw new Error("Exactly one match type is required");
  }

  let query = chatSupabase
    .from("chat_participants")
    .delete()
    .eq("environment", environment)
    .eq("user_id", numericUserId);

  if (hasOfflineMatch) {
    query = query.eq("match_id", numericMatchId);
  } else {
    query = query.eq("gaming_match_id", numericGamingMatchId);
  }

  const { error } = await query;

  if (error) {
    console.error("Chat participant removal failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: numericUserId,
      environment,
      matchId: numericMatchId,
      gamingMatchId: numericGamingMatchId,
    });

    throw new Error("Unable to remove chat participant");
  }
};
