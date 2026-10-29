import express from "express";

import {
  GetMatchDetails,
  UpdateMatchDetails,
  RemoveMatchParticipant,
  GetMatchParticipants,
} from "../controllers/MatchDetailsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get match details
router.get("/:type/:id", GetMatchDetails);

// Get participants for Match Details page
// Host is excluded from this response
router.get("/:type/:id/participants", GetMatchParticipants);

// Update match details
router.put("/:type/:id", authMiddleware, UpdateMatchDetails);

// Remove participant
router.delete(
  "/:type/:id/participants/:participantId",
  authMiddleware,
  RemoveMatchParticipant,
);

export default router;
