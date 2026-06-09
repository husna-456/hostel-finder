import express from "express";
import {
  getHostelsByOwner,
  createHostel,
  getHostelById,
  getNearbyHostels,
  getHostelsByIds,
  getMyHostels,
  updateHostel,
  deleteHostel,
  getFeaturedHostels,
  toggleFeatured,
} from "../controllers/hostelController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/list", getHostelsByOwner);
router.get("/featured", getFeaturedHostels);
router.post("/nearby", getNearbyHostels);
router.post("/by-ids", getHostelsByIds);

// Owner: get own hostels, add, edit, delete
router.get("/my-hostels", protect, checkRole("hostel_owner"), getMyHostels);
router.post("/add", protect, checkRole("hostel_owner"), createHostel);
router.put("/:id", protect, checkRole("hostel_owner"), updateHostel);
router.delete("/:id", protect, checkRole("hostel_owner"), deleteHostel);

// Admin: feature/unfeature
router.patch("/:id/feature", protect, checkRole("admin"), toggleFeatured);

// Public (must come after named routes)
router.get("/:id", getHostelById);

export default router;
