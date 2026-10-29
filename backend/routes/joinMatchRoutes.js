import express from "express";
import { fetchMatchesController } from "../controllers/joinMatchController.js";

const router = express.Router();

router.get("/", fetchMatchesController);

export default router;