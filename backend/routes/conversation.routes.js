// routes/conversation.routes.js
import express from "express";
import {
  getOrCreateConversation ,
  getUserConversations,
  getOwnerConversations,
} from "../controllers/conversation.controller.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

// ✔️ MATCHES FRONTEND
router.post("/", protect, getOrCreateConversation );

// ✔️ User inbox (client)
router.get("/user", protect, getUserConversations);

// ✔️ Owner inbox
router.get("/owner/:ownerId", protect, getOwnerConversations);

export default router;
