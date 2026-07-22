import pool from "../config/db.js";
import { fetchMatchesModel } from "../models/joinMatchModel.js";


export const joinMatch = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    // 1️⃣ Check match
    const matchRes = await pool.query(
      "SELECT * FROM matches WHERE id = $1",
      [id]
    );

    if (matchRes.rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const match = matchRes.rows[0];

    // 2️⃣ Prevent admin joining
    if (match.admin_email === user.email) {
      return res.status(400).json({
        message: "You are the organizer",
      });
    }

    // 3️⃣ Prevent duplicate join
    const exists = await pool.query(
      "SELECT * FROM match_participants WHERE match_id = $1 AND user_id = $2",
      [id, user.id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "Already joined",
      });
    }

    // 4️⃣ Check full
    if (match.current_players >= match.max_players) {
      return res.status(400).json({
        message: "Match is full",
      });
    }

    // 5️⃣ Insert participant
    await pool.query(
      "INSERT INTO match_participants (match_id, user_id) VALUES ($1, $2)",
      [id, user.id]
    );

    // 6️⃣ Update players
    const updatedPlayers = match.current_players + 1;

    const newStatus =
      updatedPlayers >= match.max_players ? "completed" : "open";

    const updated = await pool.query(
      `UPDATE matches
       SET current_players = $1, status = $2
       WHERE id = $3
       RETURNING *`,
      [updatedPlayers, newStatus, id]
    );

    res.json({
      message: "Joined successfully",
      match: updated.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getParticipants = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM match_participants
       JOIN users ON users.id = match_participants.user_id
       WHERE match_participants.match_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const fetchMatchesController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 28;
    const offset = parseInt(req.query.offset) || 0;

    const matches = await fetchMatchesModel(limit, offset);

    res.status(200).json(matches);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

