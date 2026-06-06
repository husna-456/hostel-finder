// routes/message.routes.js
import express from "express";
import {
  getMessages,
  sendMessage,
  votePoll,
  deleteMessage,
  reactToMessage,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:messageId/vote",   protect, votePoll);
router.patch("/:messageId/react", protect, reactToMessage);
router.patch("/:messageId/delete", protect, deleteMessage);
router.delete("/:messageId",      protect, deleteMessage);   // kept for backward compat
router.get("/:conversationId",    protect, getMessages);
router.post("/",                  protect, sendMessage);

export default router;
