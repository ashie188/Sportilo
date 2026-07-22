import {
  getGamingMatchesModel,
  joinGamingLobbyModel,
  getGamingParticipantsModel,
} from "../models/gamingJoinMatchModel.js";

export const getGamingMatches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 28;

    const offset = parseInt(req.query.offset) || 0;

    const matches = await getGamingMatchesModel(limit, offset);

    res.status(200).json(matches);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const joinGamingLobby = async (req, res) => {
  try {
    const gaming_match_id = req.params.id;

    const user_id = req.user.id;

    const updatedMatch = await joinGamingLobbyModel(gaming_match_id, user_id);

    res.status(200).json({
      message: "Joined successfully",
      match: updatedMatch,
    });
  } catch (error) {
    res.status(400).json({
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
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
