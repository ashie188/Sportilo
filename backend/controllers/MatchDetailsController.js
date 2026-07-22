import pool from "../config/db.js";

export const GetMatchDetails = async (req, res) => {
  try {
    console.log("Fetching match details with params:", req.params);
    const { type, id } = req.params;

    let result;

    if (type === "offline") {
      result = await pool.query(
        `
        SELECT *
        FROM matches
        WHERE id = $1
        `,
        [id],
      );
    } else if (type === "gaming") {
      result = await pool.query(
        `
        SELECT *
        FROM gaming_groups
        WHERE id = $1
        `,
        [id],
      );
    } else {
      return res.status(400).json({
        message: "Invalid match type",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
