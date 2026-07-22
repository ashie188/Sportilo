import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUserMatches } from "../controllers/accountController.js";

const router = express.Router();

router.get("/accountpagematches", authMiddleware, getUserMatches);

export default router;