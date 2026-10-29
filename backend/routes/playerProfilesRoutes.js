import express from "express";

import { getPlayerProfiles } from "../controllers/PlayerProfilesController.js";

const router = express.Router();

router.get("/", getPlayerProfiles);

export default router;
