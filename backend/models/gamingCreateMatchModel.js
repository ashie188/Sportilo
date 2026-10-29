import pool from "../config/db.js";

export const createGamingMatchModel = async ({
  adminId,
  admin_name,
  admin_email,
  game,
  platform,
  area,
  city,
  event_date,
  event_time,
  current_players,
  max_players,
  description,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = Number(current_players);
    const max = Number(max_players);

    const status = current >= max ? "full" : "open";

    const gamingMatchResult = await client.query(
      `
        INSERT INTO gaming_groups (
          admin_name,
          admin_email,
          game,
          platform,
          area,
          city,
          event_date,
          event_time,
          current_players,
          max_players,
          description,
          status
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        RETURNING *
      `,
      [
        admin_name,
        admin_email,
        game,
        platform,
        area || null,
        city || null,
        event_date,
        event_time,
        current,
        max,
        description || null,
        status,
      ],
    );

    const gamingMatch = gamingMatchResult.rows[0];

    await client.query(
      `
        INSERT INTO match_participants (
          gaming_match_id,
          user_id
        )
        VALUES ($1, $2)
      `,
      [gamingMatch.id, adminId],
    );

    await client.query("COMMIT");

    return gamingMatch;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};