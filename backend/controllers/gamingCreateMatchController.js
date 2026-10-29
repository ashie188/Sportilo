import { createGamingMatchModel } from "../models/gamingCreateMatchModel.js";
import { addChatParticipant } from "../services/chatParticipantService.js";

export const createGamingMatch = async (req, res) => {
  try {
    const user = req.user;

    const {
      game,
      platform,
      area,
      city,
      event_date,
      event_time,
      current_players,
      max_players,
      description,
    } = req.body;

    // Required fields
    if (!game || !platform || !event_date || !event_time || !max_players) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const gamingMatch = await createGamingMatchModel({
      adminId: user.id,
      admin_name: user.name,
      admin_email: user.email,
      game,
      platform,
      area,
      city,
      event_date,
      event_time,
      current_players,
      max_players,
      description,
    });

    // Add the creator to the match chat
    await addChatParticipant({
      userId: user.id,
      gamingMatchId: gamingMatch.id,
    });

    return res.status(201).json({
      message: "Gaming match created successfully",
      gamingMatch,
    });
  } catch (error) {
    console.error("Error at createGamingMatch:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
