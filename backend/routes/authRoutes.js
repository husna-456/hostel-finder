// routes/authRoutes.js
import express from "express";
import { register, login, getUserProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/dashboard", protect, getUserProfile);

export default router;
