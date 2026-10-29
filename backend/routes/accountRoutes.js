import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getUserMatches,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "../controllers/accountController.js";

const router = express.Router();

/*
 * ACCOUNT MATCHES
 *
 * /account/accountpagematches
 * → authenticated user's matches
 *
 * /account/accountpagematches/:id
 * → public player's matches
 */

// Own account matches
router.get("/accountpagematches", authMiddleware, getUserMatches);

// Public player's matches
router.get("/accountpagematches/:id", getUserMatches);

/*
 * PROFILE
 */

// Current authenticated user's profile
router.get("/profile", authMiddleware, getMyProfile);

// Current authenticated user updates their own profile
router.put("/profile", authMiddleware, updateMyProfile);

// Public player profile
router.get("/:id", getPublicProfile);

export default router;
