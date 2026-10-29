import express from "express";

import {
  getFeaturedMatches,
  getFeaturedPlayers,
} from "../controllers/featuredMatchesController.js";

const router = express.Router();

router.get("/featuredmatches", getFeaturedMatches);

router.get("/featuredplayers", getFeaturedPlayers);

export default router;
