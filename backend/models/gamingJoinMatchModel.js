import pool from "../config/db.js";
import { getExpiredMatchIds } from "../services/matchExpiry.js";

export const getGamingMatchesModel = async (limit, offset) => {
  const result = await pool.query(
    `
    SELECT *
    FROM gaming_groups
    ORDER BY created_at DESC
    LIMIT $1
    OFFSET $2
    `,
    [limit, offset],
  );

  const matches = result.rows;

  const expiredIds = getExpiredMatchIds(matches, "event_date", "event_time");

  if (expiredIds.length > 0) {
    await pool.query(
      `
      UPDATE gaming_groups
      SET status='completed'
      WHERE id = ANY($1::int[])
      `,
      [expiredIds],
    );

    const expiredSet = new Set(expiredIds);

    matches.forEach((match) => {
      if (expiredSet.has(match.id)) {
        match.status = "completed";
      }
    });
  }

  return matches;
};

export const joinGamingLobbyModel = async (gaming_match_id, user_id) => {
  // CHECK IF ALREADY JOINED

  const alreadyJoined = await pool.query(
    `
    SELECT *
    FROM match_participants

    WHERE gaming_match_id = $1
    AND user_id = $2
    `,
    [gaming_match_id, user_id],
  );

  if (alreadyJoined.rows.length > 0) {
    throw new Error("Already joined");
  }

  // GET CURRENT LOBBY

  const currentMatch = await pool.query(
    `
    SELECT *
    FROM gaming_groups

    WHERE id = $1
    `,
    [gaming_match_id],
  );

  if (currentMatch.rows.length === 0) {
    throw new Error("Lobby not found");
  }

  const match = currentMatch.rows[0];

  // CHECK IF FULL

  if (match.current_players >= match.max_players) {
    throw new Error("Lobby full");
  }

  // INSERT PARTICIPANT

  await pool.query(
    `
    INSERT INTO match_participants
    (
      user_id,
      gaming_match_id
    )

    VALUES ($1, $2)
    `,
    [user_id, gaming_match_id],
  );

  // UPDATE PLAYER COUNT

  const updatedMatch = await pool.query(
    `
    UPDATE gaming_groups

    SET current_players =
      current_players + 1

    WHERE id = $1

    RETURNING *
    `,
    [gaming_match_id],
  );

  return updatedMatch.rows[0];
};

export const getGamingParticipantsModel = async (gaming_match_id) => {
  const result = await pool.query(
    `
      SELECT users.id, users.name

      FROM match_participants

      JOIN users

      ON match_participants.user_id = users.id

      WHERE match_participants.gaming_match_id = $1
      `,
    [gaming_match_id],
  );

  return result.rows;
};
