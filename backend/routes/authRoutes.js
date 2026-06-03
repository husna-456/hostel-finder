// routes/authRoutes.js
import express from "express";
import { register, login, getUserProfile, getMe, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/dashboard",       protect, getUserProfile);
router.get("/me",              protect, getMe);
router.put("/update-profile",  protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
