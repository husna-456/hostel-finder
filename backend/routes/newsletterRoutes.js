import express from "express";
import { subscribeNewsletter } from "../controllers/newsletterController.js";

const router = express.Router();

// Public — no auth required
router.post("/subscribe", subscribeNewsletter);

export default router;
