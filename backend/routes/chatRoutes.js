import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getChatAccessToken,
  getChatReadAccessToken,
} from "../controllers/chatController.js";

const router = express.Router();

/*
 * Write access:
 * Requires the normal Sportilo authentication token.
 *
 * The controller additionally verifies that the user
 * is either the match host or a joined participant.
 */
router.get("/access/:type/:id", authMiddleware, getChatAccessToken);

/*
 * Read access:
 * The read JWT is intentionally available without
 * Sportilo authentication because viewing match chat
 * is currently public for an existing match.
 */
router.get("/view/:type/:id", getChatReadAccessToken);

export default router;
