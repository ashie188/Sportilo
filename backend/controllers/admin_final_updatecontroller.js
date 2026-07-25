import pool from "../config/db.js";

export const updateFinalNote = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { Update_Note } = req.body;

    const note = Update_Note?.trim() || null;

    let table;

    if (type === "gaming") {
      table = "gaming_groups";
    } else if (type === "offline") {
      table = "matches";
    } else {
      return res.status(400).json({
        message: "Invalid match type",
      });
    }

    // Fetch match
    const matchResult = await pool.query(`SELECT * FROM ${table} WHERE id=$1`, [
      id,
    ]);

    if (matchResult.rows.length === 0) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const match = matchResult.rows[0];

    // Organizer verification
    if (match.admin_email !== req.user.email) {
      return res.status(403).json({
        message: "Only organizer can update the note",
      });
    }

    const updatedMatch = await pool.query(
      `
  UPDATE ${table}
  SET
    Update_Note = $1,
    Update_Note_Updated_At = NOW()
  WHERE id = $2
  RETURNING *
  `,
      [note, id],
    );

    return res.status(200).json({
      message: "Update note saved successfully",
      match: updatedMatch.rows[0],
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
