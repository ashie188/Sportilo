import pool from "../config/db.js";
import { getExpiredMatchIds } from "../services/matchExpiry.js";

export const getFeaturedMatches = async (req, res) => {
  try {
    // =========================
    // LATEST OFFLINE MATCHES
    // =========================

    const offlineResult = await pool.query(
      `
SELECT *
FROM matches
ORDER BY created_at DESC
LIMIT 3
`,
    );

    const offlineMatches = offlineResult.rows;

    const offlineExpiredIds = getExpiredMatchIds(
      offlineMatches,
      "match_date",
      "match_time",
    );

    if (offlineExpiredIds.length > 0) {
      await pool.query(
        `
    UPDATE matches
    SET status='completed'
    WHERE id = ANY($1::int[])
    `,
        [offlineExpiredIds],
      );

      const expiredSet = new Set(offlineExpiredIds);

      offlineMatches.forEach((match) => {
        if (expiredSet.has(match.id)) {
          match.status = "completed";
        }
      });
    }

    // =========================
    // LATEST GAMING MATCHES
    // =========================

    const gamingResult = await pool.query(
      `
SELECT *
FROM gaming_groups
ORDER BY created_at DESC
LIMIT 3
`,
    );

    const gamingMatches = gamingResult.rows;

    const gamingExpiredIds = getExpiredMatchIds(
      gamingMatches,
      "event_date",
      "event_time",
    );

    if (gamingExpiredIds.length > 0) {
      await pool.query(
        `
    UPDATE gaming_groups
    SET status='completed'
    WHERE id = ANY($1::int[])
    `,
        [gamingExpiredIds],
      );

      const expiredSet = new Set(gamingExpiredIds);

      gamingMatches.forEach((match) => {
        if (expiredSet.has(match.id)) {
          match.status = "completed";
        }
      });
    }

    // =========================
    // MERGE RESULTS
    // =========================

    const featuredMatches = [...offlineMatches, ...gamingMatches];

    res.json(featuredMatches);
  } catch (err) {
    console.log("error at getfeaturedmatches in featuredmatchescontroller")

    res.status(500).json({
      message: "Server Error",
    });
  }
};
