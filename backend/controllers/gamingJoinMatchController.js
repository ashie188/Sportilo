import {
  getGamingMatchesModel,
  joinGamingLobbyModel,
  getGamingParticipantsModel,
} from "../models/gamingJoinMatchModel.js";

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
    const gaming_match_id = req.params.id;

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
    console.log("error at getgamingparticipants in gamingjoinmatchcontroller");

    res.status(500).json({
      message: "Server Error",
    });
  }
};
