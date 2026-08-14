import {
  getGamingMatchesModel,
  joinGamingLobbyModel,
  getGamingParticipantsModel,
} from "../models/gamingJoinMatchModel.js";
import { addChatParticipant } from "../services/chatParticipantService.js";

export const getGamingMatches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 16;

    const offset = parseInt(req.query.offset) || 0;

    const matches = await getGamingMatchesModel(limit, offset);

    res.status(200).json(matches);
  } catch (error) {
    console.log("error at getgamingmatches in gamingjoinmatchcontroller");

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const joinGamingLobby = async (req, res) => {
  try {
    const gaming_match_id = Number(req.params.id);

    if (!Number.isInteger(gaming_match_id) || gaming_match_id <= 0) {
      return res.status(400).json({
        message: "Invalid lobby ID",
      });
    }

    const user_id = req.user.id;
    const user_email = req.user.email;

    const { player_identifier, skill_level } = req.body;

    const updatedMatch = await joinGamingLobbyModel(
      gaming_match_id,
      user_id,
      user_email,
      player_identifier,
      skill_level,
    );

    await addChatParticipant({
      userId: user_id,
      gamingMatchId: gaming_match_id,
    });

    return res.status(200).json({
      message: "Joined successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Error at joinGamingLobby:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getGamingParticipants = async (req, res) => {
  try {
    const gaming_match_id = req.params.id;

    const participants = await getGamingParticipantsModel(gaming_match_id);

    res.status(200).json(participants);
  } catch (error) {
    console.log("error at getgamingparticipants in gamingjoinmatchcontroller");

    res.status(500).json({
      message: "Server Error",
    });
  }
};
