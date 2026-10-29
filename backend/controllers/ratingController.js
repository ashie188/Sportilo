import pool from "../config/db.js";

import {
  getMatchForRatingModel,
  getMatchPlayersForRatingModel,
  getUserParticipantRowModel,
  getPlayerProfileForUpdateModel,
  updatePlayerRatingsModel,
  addRatedPlayerModel,
} from "../models/ratingModel.js";

const isValidRating = (value) => {
  const rating = Number(value);

  return Number.isFinite(rating) && rating >= 1 && rating <= 5;
};

const calculateNewAverage = (currentAverage, ratingCount, newRating) => {
  const current = Number(currentAverage) || 0;

  return Number(
    ((current * ratingCount + newRating) / (ratingCount + 1)).toFixed(2),
  );
};

export const getPlayersToRate = async (req, res) => {
  try {
    const { type, id } = req.params;

    const matchId = Number(id);

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({
        message: "Invalid match ID",
      });
    }

    if (type !== "offline" && type !== "gaming") {
      return res.status(400).json({
        message: "Invalid match type",
      });
    }

    const players = await getMatchPlayersForRatingModel({
      type,
      matchId,
      userId: req.user.id,
    });

    if (!players) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const participantColumn =
      type === "offline" ? "match_id" : "gaming_match_id";

    const participantResult = await pool.query(
      `
        SELECT rated_players

        FROM match_participants

        WHERE ${participantColumn} = $1
        AND user_id = $2
      `,
      [matchId, req.user.id],
    );

    const ratedPlayers = participantResult.rows[0]?.rated_players || [];

    const ratedPlayerIds = new Set(ratedPlayers.map(Number));

    const playersToRate = players.filter(
      (player) => !ratedPlayerIds.has(Number(player.user_id)),
    );

    return res.status(200).json({
      players: playersToRate,
    });
  } catch (error) {
    console.error("Error at getPlayersToRate:", error);

    return res.status(500).json({
      message: "Unable to fetch players for rating",
    });
  }
};

export const ratePlayer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { type, id } = req.params;

    const matchId = Number(id);

    const { playerId, showUpRating, behaviorRating, skillsRating } = req.body;

    const ratedPlayerId = Number(playerId);

    const showUp = Number(showUpRating);
    const behavior = Number(behaviorRating);
    const skills = Number(skillsRating);

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({
        message: "Invalid match ID",
      });
    }

    if (type !== "offline" && type !== "gaming") {
      return res.status(400).json({
        message: "Invalid match type",
      });
    }

    if (!Number.isInteger(ratedPlayerId) || ratedPlayerId <= 0) {
      return res.status(400).json({
        message: "Invalid player",
      });
    }

    if (ratedPlayerId === Number(req.user.id)) {
      return res.status(400).json({
        message: "You cannot rate yourself",
      });
    }

    if (
      !isValidRating(showUp) ||
      !isValidRating(behavior) ||
      !isValidRating(skills)
    ) {
      return res.status(400).json({
        message: "Ratings must be between 1 and 5",
      });
    }

    await client.query("BEGIN");

    const match = await getMatchForRatingModel({
      client,
      type,
      matchId,
    });

    if (!match) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.status !== "completed") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Players can only be rated after the match is completed",
      });
    }

    const raterParticipant = await getUserParticipantRowModel({
      client,
      type,
      matchId,
      userId: req.user.id,
    });

    if (!raterParticipant) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "You did not participate in this match",
      });
    }

    const ratedPlayerParticipant = await getUserParticipantRowModel({
      client,
      type,
      matchId,
      userId: ratedPlayerId,
    });

    if (!ratedPlayerParticipant) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This player did not participate in this match",
      });
    }

    const alreadyRated = raterParticipant.rated_players?.some(
      (ratedId) => Number(ratedId) === ratedPlayerId,
    );

    if (alreadyRated) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "You have already rated this player",
      });
    }

    const playerProfile = await getPlayerProfileForUpdateModel({
      client,
      userId: ratedPlayerId,
    });

    if (!playerProfile) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Player profile not found",
      });
    }

    const currentCount = Number(playerProfile.rating_count) || 0;

    const overallRating = Number(((showUp + behavior + skills) / 3).toFixed(2));

    const updatedShowUp = calculateNewAverage(
      playerProfile.show_up_rating,
      currentCount,
      showUp,
    );

    const updatedBehavior = calculateNewAverage(
      playerProfile.behavior_rating,
      currentCount,
      behavior,
    );

    const updatedSkills = calculateNewAverage(
      playerProfile.skills_rating,
      currentCount,
      skills,
    );

    const updatedOverall = calculateNewAverage(
      playerProfile.overall_rating,
      currentCount,
      overallRating,
    );

    const updatedProfile = await updatePlayerRatingsModel({
      client,
      userId: ratedPlayerId,
      overallRating: updatedOverall,
      showUpRating: updatedShowUp,
      behaviorRating: updatedBehavior,
      skillsRating: updatedSkills,
      ratingCount: currentCount + 1,
    });

    await addRatedPlayerModel({
      client,
      participantId: raterParticipant.id,
      ratedPlayerId,
    });

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Player rated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Transaction may not have started.
    }

    console.error("Error at ratePlayer:", error);

    return res.status(500).json({
      message: "Unable to submit rating",
    });
  } finally {
    client.release();
  }
};
