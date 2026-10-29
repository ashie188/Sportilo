import { createMatchModel } from "../models/matchModel.js";
import { addChatParticipant } from "../services/chatParticipantService.js";

export const createMatch = async (req, res) => {
  try {
    const {
      sport,
      location,
      area,
      city,
      match_date,
      match_time,
      max_players,
      currentPlayers,
      description,
    } = req.body;

    const adminId = req.user.id;
    const admin_name = req.user.name;
    const admin_email = req.user.email;

    if (
      !sport?.trim() ||
      !location?.trim() ||
      !area?.trim() ||
      !city?.trim() ||
      !match_date ||
      !match_time ||
      !max_players
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const match = await createMatchModel({
      adminId,
      admin_name,
      admin_email,
      sport: sport.trim(),
      location: location.trim(),
      area: area.trim(),
      city: city.trim(),
      match_date,
      match_time,
      max_players,
      currentPlayers,
      description: description?.trim() || "",
    });

    await addChatParticipant({
      userId: adminId,
      matchId: match.id,
    });

    return res.status(201).json({
      message: "Match created successfully",
      match,
    });
  } catch (error) {
    console.error("Error at createMatch:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
