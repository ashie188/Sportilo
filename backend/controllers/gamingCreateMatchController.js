import { createGamingMatchModel } from "../models/gamingCreateMatchModel.js";

export const createGamingMatch = async (req, res) => {

  try {

    const user = req.user;

    const {
      game,
      platform,
      event_date,
      event_time,
      current_players,
      max_players,
      discord_link,
      room_code,
      description
    } = req.body;

    const gamingMatch = await createGamingMatchModel(
      user.name,
      user.email,
      game,
      platform,
      event_date,
      event_time,
      current_players,
      max_players,
      discord_link,
      room_code,
      description
    );

    res.status(201).json({
      message: "Gaming match created successfully",
      gamingMatch
    });

  } catch (error) {

    console.log("error at creategamingmatch in gamingcreatematchcontroller")

    res.status(500).json({
      message: "Server Error"
    });
  }
};