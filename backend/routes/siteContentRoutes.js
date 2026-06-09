import express from "express";
import { getPublicSiteContent } from "../controllers/siteContentController.js";

const router = express.Router();

// Public — no auth required
router.get("/:section", getPublicSiteContent);

export default router;
