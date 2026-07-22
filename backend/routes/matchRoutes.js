import express from "express";
import { createMatch } from "../controllers/matchController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { joinMatch } from "../controllers/joinmatchController.js";


const router = express.Router();

// offline Create Match (Protected)
router.post("/create", authMiddleware, createMatch);

//join match (Protected)
//to actually join the match, by inserting the user in the participants table and updating the current players count in the matches table
router.post("/join/:id", authMiddleware, joinMatch);


export default router;