import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getPlayersToRate,
  ratePlayer,
} from "../controllers/ratingController.js";

const router = express.Router();

router.get("/:type/:id/players", authMiddleware, getPlayersToRate);

router.post("/:type/:id", authMiddleware, ratePlayer);

export default router;
