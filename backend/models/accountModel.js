import pool from "../config/db.js";

/*
 * Get the authenticated user's complete profile.
 *
 * This endpoint is protected by authMiddleware, so
 * email and WhatsApp number can safely be returned here.
 */
export const getAccountProfileModel = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        player_profiles.user_id,
        users.name,
        users.email,

        player_profiles.area,
        player_profiles.city,
        player_profiles.whatsapp_number,

        player_profiles.overall_rating,
        player_profiles.show_up_rating,
        player_profiles.behavior_rating,
        player_profiles.skills_rating,

        player_profiles.offline_games,
        player_profiles.online_games,
        player_profiles.availability,

        player_profiles.willing_to_play_turf

      FROM player_profiles

      INNER JOIN users
        ON users.id = player_profiles.user_id

      WHERE player_profiles.user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

/*
 * Get only information that is safe for public profiles.
 *
 * Email and WhatsApp number are intentionally excluded.
 */
export const getPublicAccountProfileModel = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        player_profiles.user_id,
        users.name,

        player_profiles.area,
        player_profiles.city,

        player_profiles.overall_rating,
        player_profiles.show_up_rating,
        player_profiles.behavior_rating,
        player_profiles.skills_rating,

        player_profiles.offline_games,
        player_profiles.online_games,
        player_profiles.availability,

        player_profiles.willing_to_play_turf

      FROM player_profiles

      INNER JOIN users
        ON users.id = player_profiles.user_id

      WHERE player_profiles.user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

/*
 * Update only the authenticated user's profile.
 *
 * userId always comes from req.user.id in the controller.
 * The frontend never supplies the owner ID.
 */
export const updateAccountProfileModel = async ({
  userId,
  area,
  city,
  whatsappNumber,
  offlineGames,
  onlineGames,
  availability,
  willingToPlayTurf,
}) => {
  const result = await pool.query(
    `
      UPDATE player_profiles

      SET
        area = $1,
        city = $2,
        whatsapp_number = $3,
        offline_games = $4::jsonb,
        online_games = $5::jsonb,
        availability = $6::jsonb,
        willing_to_play_turf = $7,
        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $8

      RETURNING
        user_id,
        area,
        city,
        whatsapp_number,
        overall_rating,
        show_up_rating,
        behavior_rating,
        skills_rating,
        offline_games,
        online_games,
        availability,
        willing_to_play_turf,
        created_at,
        updated_at
    `,
    [
      area,
      city,
      whatsappNumber,
      JSON.stringify(offlineGames),
      JSON.stringify(onlineGames),
      JSON.stringify(availability),
      willingToPlayTurf,
      userId,
    ],
  );

  return result.rows[0] || null;
};
