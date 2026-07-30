import pool from "../config/db.js";

export const getUserMatches = async (req, res) => {
  const user = req.user;

  try {
    // =========================
    // OFFLINE CREATED
    // =========================

    const createdOfflineMatches = await pool.query(
      `
        SELECT *
        FROM matches

        WHERE admin_email = $1
        `,
      [user.email],
    );

    // =========================
    // OFFLINE JOINED
    // =========================

    const joinedOfflineMatches = await pool.query(
      `
        SELECT matches.*

        FROM match_participants

        JOIN matches

        ON matches.id =
        match_participants.match_id

        WHERE match_participants.user_id = $1
        `,
      [user.id],
    );

    // =========================
    // GAMING CREATED
    // =========================

    const createdGamingMatches = await pool.query(
      `
        SELECT *
        FROM gaming_groups

        WHERE admin_email = $1
        `,
      [user.email],
    );

    // =========================
    // GAMING JOINED
    // =========================

    const joinedGamingMatches = await pool.query(
      `
        SELECT gaming_groups.*

        FROM match_participants

        JOIN gaming_groups

        ON gaming_groups.id =
        match_participants.gaming_match_id

        WHERE match_participants.user_id = $1
        `,
      [user.id],
    );

    // =========================
    // MERGE ALL
    // =========================

    const allMatches = [
      ...createdOfflineMatches.rows,

      ...joinedOfflineMatches.rows,

      ...createdGamingMatches.rows,

      ...joinedGamingMatches.rows,
    ];

    // =========================
    // REMOVE DUPLICATES
    // =========================

    const uniqueMatches = Array.from(
      new Map(allMatches.map((m) => [`${m.type}-${m.id}`, m])).values(),
    );

    // =========================
    // ACTIVE MATCHES
    // =========================

    const activeMatches = uniqueMatches.filter((m) => m.status === "open");

    // =========================
    // HISTORY MATCHES
    // =========================

    const historyMatches = uniqueMatches.filter(
      (m) => m.status === "completed",
    );

    // =========================
    // RESPONSE
    // =========================

    res.json({
      activeMatches,
      historyMatches,
    });
  } catch (err) {
    console.log("error at getusermatches in accountcontroller");

    res.status(500).json({
      message: "Server error",
    });
  }
};
