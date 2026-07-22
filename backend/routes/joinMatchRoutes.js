import express from "express";
import { fetchMatchesController } from "../controllers/joinMatchController.js";
import { getParticipants } from "../controllers/joinMatchController.js";

const router = express.Router();

router.get("/", fetchMatchesController);

//participants joining match (Protected)
//to get the participants of the match, for rendering in the match details page
router.get("/participants/:id", getParticipants);

export default router;