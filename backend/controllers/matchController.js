import { createMatchModel } from "../models/matchModel.js";

export const createMatch = async (req, res) => {
  console.log("inside create match controller");
  try {
    const {
      sport,
      location,
      match_date,
      match_time,
      max_players,
      currentPlayers,
      description
    } = req.body;

    console.log(req.body);

    // ✅ from JWT
    const admin_name = req.user.name;
    const admin_email = req.user.email;

    // validation
    if (!sport || !location || !match_date || !match_time || !max_players) {
      console.log("validation failed: missing fields in group creation");
      return res.status(400).json({ message: "All fields are required" });
    }

    const match = await createMatchModel({
      admin_name,
      admin_email,
      sport,
      location,
      match_date,
      match_time,
      max_players,
      currentPlayers,
      description
    });

    console.log("group Match created"),
    res.status(201).json({
      message: "Match created successfully",
      match
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};