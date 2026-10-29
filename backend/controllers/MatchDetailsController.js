import pool from "../config/db.js";
import { removeChatParticipant } from "../services/chatParticipantService.js";
import { getMatchParticipantsModel } from "../models/matchDetailsModel.js";

export const GetMatchDetails = async (req, res) => {
  try {
    const { type, id } = req.params;

    const matchId = Number(id);

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({
        message: "Invalid match ID",
      });
    }

    let result;

    if (type === "offline") {
      result = await pool.query(
        `
        SELECT *
        FROM matches
        WHERE id = $1
        `,
        [matchId],
      );
    } else if (type === "gaming") {
      result = await pool.query(
        `
        SELECT *
        FROM gaming_groups
        WHERE id = $1
        `,
        [matchId],
      );
    } else {
      return res.status(400).json({
        message: "Invalid match type",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error at GetMatchDetails:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const UpdateMatchDetails = async (req, res) => {
  const client = await pool.connect();

  try {
    const { type, id } = req.params;

    const matchId = Number(id);

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({
        message: "Invalid match ID.",
      });
    }

    const {
      location,
      area,
      city,
      match_date,
      match_time,
      event_date,
      event_time,
      description,
    } = req.body;

    const currentPlayers = Number(req.body.current_players);
    const maxPlayers = Number(req.body.max_players);

    if (!Number.isInteger(currentPlayers) || !Number.isInteger(maxPlayers)) {
      return res.status(400).json({
        message: "Player counts must be valid whole numbers.",
      });
    }

    if (currentPlayers < 1) {
      return res.status(400).json({
        message: "Current players must be at least 1.",
      });
    }

    if (maxPlayers < currentPlayers) {
      return res.status(400).json({
        message: "Maximum players cannot be less than current players.",
      });
    }

    if (type !== "offline" && type !== "gaming") {
      return res.status(400).json({
        message: "Invalid match type.",
      });
    }

    await client.query("BEGIN");

    const isOffline = type === "offline";

    const tableName = isOffline ? "matches" : "gaming_groups";

    const dateColumn = isOffline ? "match_date" : "event_date";

    const timeColumn = isOffline ? "match_time" : "event_time";

    const participantColumn = isOffline ? "match_id" : "gaming_match_id";

    const dateValue = isOffline ? match_date : event_date;

    const timeValue = isOffline ? match_time : event_time;

    if (!dateValue || !timeValue) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Date and time are required.",
      });
    }

    if (isOffline && (!location?.trim() || !area?.trim() || !city?.trim())) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Location, area and city are required.",
      });
    }

    const existingMatch = await client.query(
      `
      SELECT *
      FROM ${tableName}
      WHERE id = $1
      FOR UPDATE
      `,
      [matchId],
    );

    if (existingMatch.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: isOffline ? "Match not found." : "Lobby not found.",
      });
    }

    const match = existingMatch.rows[0];

    if (match.admin_email !== req.user.email) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: isOffline
          ? "Only the host can edit this match."
          : "Only the host can edit this lobby.",
      });
    }

    const participantResult = await client.query(
      `
      SELECT COUNT(*)::int AS count
      FROM match_participants
      WHERE ${participantColumn} = $1
      `,
      [matchId],
    );

    const minimumPlayers = participantResult.rows[0].count + 1;

    if (currentPlayers < minimumPlayers) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Current players cannot be less than the host and joined participants.",
      });
    }

    const status =
      match.status === "completed"
        ? "completed"
        : currentPlayers >= maxPlayers
          ? "full"
          : "open";

    let updatedMatch;

    if (isOffline) {
      updatedMatch = await client.query(
        `
      UPDATE matches
      SET
        location = $1,
        area = $2,
        city = $3,
        match_date = $4,
        match_time = $5,
        current_players = $6,
        max_players = $7,
        description = $8,
        status = $9
      WHERE id = $10
      RETURNING *
    `,
        [
          location.trim(),
          area.trim(),
          city.trim(),
          dateValue,
          timeValue,
          currentPlayers,
          maxPlayers,
          description?.trim() || null,
          status,
          matchId,
        ],
      );
    } else {
      updatedMatch = await client.query(
        `
      UPDATE gaming_groups
      SET
        area = $1,
        city = $2,
        event_date = $3,
        event_time = $4,
        current_players = $5,
        max_players = $6,
        description = $7,
        status = $8
      WHERE id = $9
      RETURNING *
    `,
        [
          area?.trim() || null,
          city?.trim() || null,
          dateValue,
          timeValue,
          currentPlayers,
          maxPlayers,
          description?.trim() || null,
          status,
          matchId,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Match updated successfully.",
      match: updatedMatch.rows[0],
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Transaction may not have started.
    }

    console.error("Error at UpdateMatchDetails:", err);

    return res.status(500).json({
      message: "Unable to update the match.",
    });
  } finally {
    client.release();
  }
};

export const RemoveMatchParticipant = async (req, res) => {
  const client = await pool.connect();

  try {
    const { type, id, participantId } = req.params;

    const matchId = Number(id);
    const userId = Number(participantId);

    if (
      !Number.isInteger(matchId) ||
      matchId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid request.",
      });
    }

    if (type !== "offline" && type !== "gaming") {
      return res.status(400).json({
        message: "Invalid match type.",
      });
    }

    const isOffline = type === "offline";

    const tableName = isOffline ? "matches" : "gaming_groups";

    const participantColumn = isOffline ? "match_id" : "gaming_match_id";

    const notFoundMessage = isOffline ? "Match not found." : "Lobby not found.";

    await client.query("BEGIN");

    const existingMatch = await client.query(
      `
      SELECT *
      FROM ${tableName}
      WHERE id = $1
      FOR UPDATE
      `,
      [matchId],
    );

    if (existingMatch.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: notFoundMessage,
      });
    }

    const match = existingMatch.rows[0];

    if (match.admin_email !== req.user.email) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "Only the host can remove participants.",
      });
    }

    const participant = await client.query(
      `
      DELETE FROM match_participants
      WHERE ${participantColumn} = $1
      AND user_id = $2
      RETURNING *
      `,
      [matchId, userId],
    );

    if (participant.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Participant not found.",
      });
    }

    /*
     * Remove the participant from the Supabase chat database.
     *
     * This happens before committing the main database transaction.
     * If the chat removal fails, the PostgreSQL participant deletion
     * is rolled back and the participant remains in the match.
     */
    if (isOffline) {
      await removeChatParticipant({
        userId,
        matchId,
      });
    } else {
      await removeChatParticipant({
        userId,
        gamingMatchId: matchId,
      });
    }

    const newPlayerCount = Math.max(1, match.current_players - 1);

    const newStatus =
      match.status === "completed"
        ? "completed"
        : newPlayerCount >= match.max_players
          ? "full"
          : "open";

    const updatedMatch = await client.query(
      `
      UPDATE ${tableName}
      SET
        current_players = $1,
        status = $2
      WHERE id = $3
      RETURNING *
      `,
      [newPlayerCount, newStatus, matchId],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Participant removed successfully.",
      match: updatedMatch.rows[0],
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Error rolling back participant removal:", rollbackError);
    }

    console.error("Error at RemoveMatchParticipant:", err);

    return res.status(500).json({
      message: "Unable to remove participant.",
    });
  } finally {
    client.release();
  }
};

export const GetMatchParticipants = async (req, res) => {
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

    const participants = await getMatchParticipantsModel({
      type,
      matchId,
    });

    return res.status(200).json(participants);
  } catch (error) {
    console.error("Error at GetMatchParticipants:", error);

    return res.status(500).json({
      message: "Unable to fetch match participants",
    });
  }
};
