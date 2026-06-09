import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
  deleteOne,
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/",                  getNotifications);
router.get("/unread-count",      getUnreadCount);
router.patch("/mark-all-read",   markAllRead);
router.patch("/:id/read",        markOneRead);
router.delete("/:id",            deleteOne);

export default router;
