import pool from "../config/db.js";

import {
  getAccountProfileModel,
  getPublicAccountProfileModel,
  updateAccountProfileModel,
} from "../models/accountModel.js";

/* =========================================================
   CONSTANTS
========================================================= */

const ALLOWED_SKILL_LEVELS = new Set([
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
]);

const ALLOWED_AVAILABILITY_DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const ALLOWED_TIME_SLOTS = new Set([
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
]);

/*
 * Keep the supported games centralized.
 *
 * Update these arrays when Sportilo adds more games.
 */
const ALLOWED_OFFLINE_GAMES = new Set([
  "Football",
  "Cricket",
  "Tennis",
  "Badminton",
  "Basketball",
  "Volleyball",
  "Table Tennis",
]);

const ALLOWED_ONLINE_GAMES = new Set([
  "BGMI",
  "Valorant",
  "Free Fire",
  "Call of Duty",
  "FIFA",
  "EA FC",
  "eFootball",
  "Counter-Strike 2",
]);

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const parsePositiveInteger = (value) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
};

const validateGames = (games, allowedGames) => {
  if (!Array.isArray(games)) {
    return false;
  }

  const seenGames = new Set();

  for (const item of games) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false;
    }

    const game = typeof item.game === "string" ? item.game.trim() : "";

    const skillLevel =
      typeof item.skill_level === "string" ? item.skill_level.trim() : "";

    if (
      !game ||
      !allowedGames.has(game) ||
      !ALLOWED_SKILL_LEVELS.has(skillLevel)
    ) {
      return false;
    }

    if (seenGames.has(game)) {
      return false;
    }

    seenGames.add(game);
  }

  return true;
};

const validateAvailability = (availability) => {
  if (
    !availability ||
    typeof availability !== "object" ||
    Array.isArray(availability)
  ) {
    return false;
  }

  for (const [day, slots] of Object.entries(availability)) {
    if (!ALLOWED_AVAILABILITY_DAYS.has(day)) {
      return false;
    }

    if (!Array.isArray(slots)) {
      return false;
    }

    const seenSlots = new Set();

    for (const slot of slots) {
      if (
        typeof slot !== "string" ||
        !ALLOWED_TIME_SLOTS.has(slot) ||
        seenSlots.has(slot)
      ) {
        return false;
      }

      seenSlots.add(slot);
    }
  }

  return true;
};

/* =========================================================
   MATCHES
========================================================= */

export const getUserMatches = async (req, res) => {
  try {
    /*
     * If an ID exists, this is a public profile request.
     * Otherwise, use the authenticated user's ID.
     */
    const requestedUserId = req.params.id
      ? parsePositiveInteger(req.params.id)
      : req.user?.id;

    if (!requestedUserId) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    /*
     * We need the email only because the existing match
     * tables identify organizers through admin_email.
     */
    const userResult = await pool.query(
      `
        SELECT id, email
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [requestedUserId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profileUser = userResult.rows[0];

    const [
      createdOfflineMatches,
      joinedOfflineMatches,
      createdGamingMatches,
      joinedGamingMatches,
    ] = await Promise.all([
      pool.query(
        `
          SELECT *
          FROM matches
          WHERE admin_email = $1
        `,
        [profileUser.email],
      ),

      pool.query(
        `
          SELECT matches.*
          FROM match_participants
          INNER JOIN matches
            ON matches.id = match_participants.match_id
          WHERE match_participants.user_id = $1
        `,
        [requestedUserId],
      ),

      pool.query(
        `
          SELECT *
          FROM gaming_groups
          WHERE admin_email = $1
        `,
        [profileUser.email],
      ),

      pool.query(
        `
          SELECT gaming_groups.*
          FROM match_participants
          INNER JOIN gaming_groups
            ON gaming_groups.id = match_participants.gaming_match_id
          WHERE match_participants.user_id = $1
        `,
        [requestedUserId],
      ),
    ]);

    const allMatches = [
      ...createdOfflineMatches.rows,
      ...joinedOfflineMatches.rows,
      ...createdGamingMatches.rows,
      ...joinedGamingMatches.rows,
    ];

    /*
     * A user can appear in a match both as organizer and
     * participant, so remove duplicates.
     */
    const uniqueMatches = Array.from(
      new Map(
        allMatches.map((match) => [`${match.type}-${match.id}`, match]),
      ).values(),
    );

    const activeMatches = uniqueMatches.filter(
      (match) => match.status === "open",
    );

    const historyMatches = uniqueMatches.filter(
      (match) => match.status === "completed",
    );

    return res.status(200).json({
      activeMatches,
      historyMatches,
    });
  } catch (err) {
    console.error("Error at getUserMatches:", err);

    return res.status(500).json({
      message: "Unable to fetch matches",
    });
  }
};

/* =========================================================
   OWN PROFILE
========================================================= */

export const getMyProfile = async (req, res) => {
  try {
    const profile = await getAccountProfileModel(req.user.id);

    if (!profile) {
      return res.status(404).json({
        message: "Player profile not found",
      });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("Error at getMyProfile:", err);

    return res.status(500).json({
      message: "Unable to fetch profile",
    });
  }
};

/* =========================================================
   PUBLIC PROFILE
========================================================= */

export const getPublicProfile = async (req, res) => {
  try {
    const userId = parsePositiveInteger(req.params.id);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid player ID",
      });
    }

    const profile = await getPublicAccountProfileModel(userId);

    if (!profile) {
      return res.status(404).json({
        message: "Player profile not found",
      });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error("Error at getPublicProfile:", err);

    return res.status(500).json({
      message: "Unable to fetch player profile",
    });
  }
};

/* =========================================================
   UPDATE OWN PROFILE
========================================================= */

export const updateMyProfile = async (req, res) => {
  try {
    const {
      area,
      city,
      whatsappNumber,
      offlineGames,
      onlineGames,
      availability,
      willingToPlayTurf,
    } = req.body;

    const cleanArea = typeof area === "string" ? area.trim() : "";

    const cleanCity = typeof city === "string" ? city.trim() : "";

    if (!cleanArea || !cleanCity) {
      return res.status(400).json({
        message: "Area and city are required",
      });
    }

    if (cleanArea.length > 100 || cleanCity.length > 100) {
      return res.status(400).json({
        message: "Area or city is too long",
      });
    }

    let cleanWhatsapp = null;

    if (whatsappNumber !== null && whatsappNumber !== undefined) {
      if (typeof whatsappNumber !== "string") {
        return res.status(400).json({
          message: "Invalid WhatsApp number",
        });
      }

      cleanWhatsapp = whatsappNumber.trim();

      if (cleanWhatsapp.length > 20) {
        return res.status(400).json({
          message: "Invalid WhatsApp number",
        });
      }
    }

    if (!validateGames(offlineGames, ALLOWED_OFFLINE_GAMES)) {
      return res.status(400).json({
        message: "Invalid offline games data",
      });
    }

    if (!validateGames(onlineGames, ALLOWED_ONLINE_GAMES)) {
      return res.status(400).json({
        message: "Invalid online games data",
      });
    }

    if (!validateAvailability(availability)) {
      return res.status(400).json({
        message: "Invalid availability data",
      });
    }

    if (typeof willingToPlayTurf !== "boolean") {
      return res.status(400).json({
        message: "Invalid turf preference",
      });
    }

    const profile = await updateAccountProfileModel({
      userId: req.user.id,
      area: cleanArea,
      city: cleanCity,
      whatsappNumber: cleanWhatsapp || null,
      offlineGames,
      onlineGames,
      availability,
      willingToPlayTurf,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Player profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (err) {
    console.error("Error at updateMyProfile:", err);

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};
