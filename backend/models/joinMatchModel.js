import pool from "../config/db.js";
import { getExpiredMatchIds } from "../services/matchExpiry.js";

export const fetchMatchesModel = async (limit, offset) => {
  const result = await pool.query(
    `
    SELECT *
    FROM matches
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  const matches = result.rows;

  const expiredIds = getExpiredMatchIds(matches, "match_date", "match_time");

  console.log("Expired IDs:", expiredIds);

  if (expiredIds.length > 0) {  
    await pool.query(
      `
      UPDATE matches
      SET status = 'completed'
      WHERE id = ANY($1::int[])
      `,
      [expiredIds],
    );

    console.log(updateResult.rows);

    const expiredSet = new Set(expiredIds);

    matches.forEach((match) => {
      if (expiredSet.has(match.id)) {
        match.status = "completed";
      }
    });
  }

  return matches;
};
