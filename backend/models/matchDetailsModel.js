import pool from "../config/db.js";

export const getMatchParticipantsModel = async ({ type, matchId }) => {
  const isOffline = type === "offline";

  const matchTable = isOffline ? "matches" : "gaming_groups";

  const participantColumn = isOffline ? "match_id" : "gaming_match_id";

  const result = await pool.query(
    `
      SELECT
        users.id,
        users.name,
        users.email,
        match_participants.player_identifier,
        match_participants.skill_level

      FROM match_participants

      INNER JOIN users
        ON users.id = match_participants.user_id

      WHERE match_participants.${participantColumn} = $1

      AND match_participants.user_id <> (
        SELECT id
        FROM users
        WHERE email = (
          SELECT admin_email
          FROM ${matchTable}
          WHERE id = $1
        )
      )

      ORDER BY match_participants.joined_at ASC
    `,
    [matchId],
  );

  return result.rows;
};