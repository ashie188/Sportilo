import pool from "../config/db.js";

export const getMatchForRatingModel = async ({ client, type, matchId }) => {
  const tableName = type === "offline" ? "matches" : "gaming_groups";

  const result = await client.query(
    `
      SELECT *
      FROM ${tableName}
      WHERE id = $1
      FOR UPDATE
    `,
    [matchId],
  );

  return result.rows[0] || null;
};

export const getMatchPlayersForRatingModel = async ({
  type,
  matchId,
  userId,
}) => {
  const participantColumn = type === "offline" ? "match_id" : "gaming_match_id";

  const tableName = type === "offline" ? "matches" : "gaming_groups";

  const matchResult = await pool.query(
    `
      SELECT admin_email
      FROM ${tableName}
      WHERE id = $1
    `,
    [matchId],
  );

  if (matchResult.rows.length === 0) {
    return null;
  }

  const participantsResult = await pool.query(
    `
      SELECT
        mp.user_id,
        users.name,
        player_profiles.overall_rating,
        player_profiles.show_up_rating,
        player_profiles.behavior_rating,
        player_profiles.skills_rating,
        player_profiles.rating_count

      FROM match_participants mp

      INNER JOIN users
        ON users.id = mp.user_id

      LEFT JOIN player_profiles
        ON player_profiles.user_id = mp.user_id

      WHERE mp.${participantColumn} = $1
    `,
    [matchId],
  );

  return participantsResult.rows.filter(
    (player) => Number(player.user_id) !== Number(userId),
  );
};

export const getUserParticipantRowModel = async ({
  client,
  type,
  matchId,
  userId,
}) => {
  const participantColumn = type === "offline" ? "match_id" : "gaming_match_id";

  const result = await client.query(
    `
      SELECT *
      FROM match_participants
      WHERE ${participantColumn} = $1
      AND user_id = $2
      FOR UPDATE
    `,
    [matchId, userId],
  );

  return result.rows[0] || null;
};

export const getPlayerProfileForUpdateModel = async ({ client, userId }) => {
  const result = await client.query(
    `
      SELECT *
      FROM player_profiles
      WHERE user_id = $1
      FOR UPDATE
    `,
    [userId],
  );

  return result.rows[0] || null;
};

export const updatePlayerRatingsModel = async ({
  client,
  userId,
  overallRating,
  showUpRating,
  behaviorRating,
  skillsRating,
  ratingCount,
}) => {
  const result = await client.query(
    `
      UPDATE player_profiles

      SET
        overall_rating = $1,
        show_up_rating = $2,
        behavior_rating = $3,
        skills_rating = $4,
        rating_count = $5,
        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $6

      RETURNING *
    `,
    [
      overallRating,
      showUpRating,
      behaviorRating,
      skillsRating,
      ratingCount,
      userId,
    ],
  );

  return result.rows[0];
};

export const addRatedPlayerModel = async ({
  client,
  participantId,
  ratedPlayerId,
}) => {
  const result = await client.query(
    `
      UPDATE match_participants

      SET
        rated_players =
          CASE
            WHEN rated_players @> jsonb_build_array($1::integer)
            THEN rated_players
            ELSE rated_players || jsonb_build_array($1::integer)
          END

      WHERE id = $2

      RETURNING rated_players
    `,
    [ratedPlayerId, participantId],
  );

  return result.rows[0];
};
