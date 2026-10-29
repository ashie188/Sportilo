import pool from "../config/db.js";

export const getPlayerProfilesModel = async ({
  search = "",
  limit = 20,
  offset = 0,
}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`
      (
        users.name ILIKE $${values.length}
        OR player_profiles.area ILIKE $${values.length}
        OR player_profiles.city ILIKE $${values.length}
      )
    `);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        player_profiles.user_id,
        users.name,
        player_profiles.area,
        player_profiles.city,
        player_profiles.overall_rating,
        player_profiles.show_up_rating,
        player_profiles.willing_to_play_turf

      FROM player_profiles

      INNER JOIN users
        ON users.id = player_profiles.user_id

      ${whereClause}

      ORDER BY
        player_profiles.overall_rating DESC,
        users.name ASC

      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  return result.rows;
};
