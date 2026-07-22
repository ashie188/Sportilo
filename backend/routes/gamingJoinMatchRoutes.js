import express from "express";
import {
  getGamingMatches,
  joinGamingLobby,
  getGamingParticipants,
} from "../controllers/gamingJoinMatchController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//route to get gaming matches for join match page
router.get("/", getGamingMatches);

//route to join gaming lobby, i.e add participants in the table and update current players count
router.post("/join/:id", authMiddleware, joinGamingLobby);

//to fecth participants of the gaming lobby and show in the match details page
router.get(
  "/participants/:id",
  getGamingParticipants
);

export default router;
