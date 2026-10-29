import db from "../config/db.js";

export const createMatchModel = async ({
  adminId,
  admin_name,
  admin_email,
  sport,
  location,
  area,
  city,
  match_date,
  match_time,
  max_players,
  currentPlayers,
  description,
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const current = Number(currentPlayers);
    const max = Number(max_players);

    const status = current >= max ? "full" : "open";

    const matchResult = await client.query(
      `
        INSERT INTO matches (
  admin_name,
  admin_email,
  sport,
  location,
  area,
  city,
  match_date,
  match_time,
  current_players,
  max_players,
  description,
  status
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
      `,
      [
        admin_name,
        admin_email,
        sport,
        location,
        area,
        city,
        match_date,
        match_time,
        current,
        max,
        description,
        status,
      ],
    );

    const match = matchResult.rows[0];

    await client.query(
      `
        INSERT INTO match_participants (
          match_id,
          user_id
        )
        VALUES ($1, $2)
      `,
      [match.id, adminId],
    );

    await client.query("COMMIT");

    return match;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
