import express from "express";
import { getFeaturedMatches } from "../controllers/featuredMatchesController.js";

const router = express.Router();

router.get("/featuredmatches", getFeaturedMatches);

export default router;