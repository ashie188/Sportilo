import db from "../config/db.js";

export const createMatchModel = async ({
  admin_name,
  admin_email,
  sport,
  location,
  match_date,
  match_time,
  max_players,
  currentPlayers,
  description,
}) => {
  
  // ✅ initial status logic
  const current = Number(currentPlayers);
  const max = Number(max_players);
  
  const status = current >= max ? "full" : "open";

  const query = `
    INSERT INTO matches (
      admin_name,
      admin_email,
      sport,
      location,
      match_date,
      match_time,
      current_players,
      max_players,
      description,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    admin_name,
    admin_email,
    sport,
    location,
    match_date,
    match_time,
    currentPlayers,
    max_players,
    description,
    status,
  ];

  const result = await db.query(query, values);

  return result.rows[0];
};
