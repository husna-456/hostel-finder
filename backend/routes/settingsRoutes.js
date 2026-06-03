import express from "express";
import { getPublicSettings } from "../controllers/settingsController.js";

const router = express.Router();

// Public — no auth required
router.get("/public", getPublicSettings);

export default router;
