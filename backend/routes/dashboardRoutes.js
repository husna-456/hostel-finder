import express from "express";
import {
  getDashboardData,
  getUserDashboard,
  getOwnerDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getDashboardData);
router.get("/user",   protect, checkRole("user"),         getUserDashboard);
router.get("/owner",  protect, checkRole("hostel_owner"), getOwnerDashboard);
router.get("/admin",  protect, checkRole("admin"),        getAdminDashboard);

export default router;
