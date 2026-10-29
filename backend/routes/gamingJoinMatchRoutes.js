import express from "express";
import {
  getGamingMatches,
  joinGamingLobby,
} from "../controllers/gamingJoinMatchController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//route to get gaming matches for join match page
router.get("/", getGamingMatches);

//route to join gaming lobby, i.e add participants in the table and update current players count
router.post("/join/:id", authMiddleware, joinGamingLobby);

export default router;
