import express from "express";
import {
  createReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  adminEditReview,
  adminDeleteReview,
  getReviewStats,
} from "../controllers/reviewController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/approved", getApprovedReviews);

// User
router.post("/", protect, checkRole("user"), createReview);
router.get("/my", protect, checkRole("user"), getMyReviews);
router.put("/:id", protect, checkRole("user"), updateReview);
router.delete("/:id", protect, checkRole("user"), deleteReview);

// Admin
router.get("/stats", protect, checkRole("admin"), getReviewStats);
router.get("/", protect, checkRole("admin"), getAllReviews);
router.patch("/:id/approve", protect, checkRole("admin"), approveReview);
router.patch("/:id/reject", protect, checkRole("admin"), rejectReview);
router.put("/admin/:id", protect, checkRole("admin"), adminEditReview);
router.delete("/admin/:id", protect, checkRole("admin"), adminDeleteReview);

export default router;
