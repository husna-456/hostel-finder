// routes/conversation.routes.js
import express from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getOwnerConversations,
  markAllRead,
  archiveAll,
  unarchiveAll,
} from "../controllers/conversation.controller.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark-all-read", protect, markAllRead);
router.post("/archive-all", protect, archiveAll);
router.post("/unarchive-all", protect, unarchiveAll);

router.post("/", protect, getOrCreateConversation);

router.get("/user", protect, getUserConversations);

router.get("/owner/:ownerId", protect, getOwnerConversations);

export default router;
