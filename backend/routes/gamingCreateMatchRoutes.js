import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import { createGamingMatch } from "../controllers/gamingCreateMatchController.js";

const router = express.Router();

router.post("/create", authMiddleware, createGamingMatch);

export default router;
