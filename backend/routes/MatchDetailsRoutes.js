import express from "express";
import { GetMatchDetails } from "../controllers/MatchDetailsController.js";

const router = express.Router();

router.get("/:type/:id", GetMatchDetails);

export default router;
