import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateFinalNote } from "../controllers/admin_final_updatecontroller.js";

const router = express.Router();

router.patch("/:type/:id", authMiddleware, updateFinalNote);

export default router;
