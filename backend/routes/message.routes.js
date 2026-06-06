// routes/message.routes.js
import express from "express";
import { getMessages, sendMessage, votePoll } from "../controllers/message.controller.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:messageId/vote", protect, votePoll);
router.get("/:conversationId", protect, getMessages);
router.post("/", protect, sendMessage);

export default router;

