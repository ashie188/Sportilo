import pool from "../config/db.js";

export const createGamingMatchModel = async (
  admin_name,
  admin_email,
  game,
  platform,
  event_date,
  event_time,
  current_players,
  max_players,
  discord_link,
  room_code,
  description
) => {

  const result = await pool.query(
    `
    INSERT INTO gaming_groups (
      admin_name,
      admin_email,
      game,
      platform,
      event_date,
      event_time,
      current_players,
      max_players,
      discord_link,
      room_code,
      description
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    )
    RETURNING *
    `,
    [
      admin_name,
      admin_email,
      game,
      platform,
      event_date,
      event_time,
      current_players,
      max_players,
      discord_link,
      room_code,
      description
    ]
  );

  return result.rows[0];
};
