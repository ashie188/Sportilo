import { getPlayerProfilesModel } from "../models/playerProfilesModel.js";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

export const getPlayerProfiles = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";

    const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_LIMIT);

    const limit = Math.min(requestedLimit || DEFAULT_LIMIT, MAX_LIMIT);

    const offset = parsePositiveInteger(req.query.offset, 0);

    const players = await getPlayerProfilesModel({
      search,
      limit,
      offset,
    });

    return res.status(200).json(players);
  } catch (error) {
    console.error("Error at getPlayerProfiles:", error);

    return res.status(500).json({
      message: "Unable to fetch player profiles",
    });
  }
};
