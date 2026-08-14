import { createMatchModel } from "../models/matchModel.js";
import { addChatParticipant } from "../services/chatParticipantService.js";

export const createMatch = async (req, res) => {
  try {
    const {
      sport,
      location,
      match_date,
      match_time,
      max_players,
      currentPlayers,
      description,
    } = req.body;

    // ✅ from JWT
    const admin_name = req.user.name;
    const admin_email = req.user.email;

    // validation
    if (!sport || !location || !match_date || !match_time || !max_players) {
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
      description,
    });

    await addChatParticipant({
      userId: req.user.id,
      matchId: match.id,
    });

    res.status(201).json({
      message: "Match created successfully",
      match,
    });
  } catch (error) {
    console.log("error at creatematch in matchcontroller");
    res.status(500).json({ message: "Server error" });
  }
};
