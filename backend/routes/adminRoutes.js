import express from "express";
import { getAllUsers, getUserById, deleteUser, updateUserRole } from "../controllers/adminController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Only admins can access these routes
router.get("/users", protect, checkRole("admin"), getAllUsers);
router.get("/users/:id", protect, checkRole("admin"), getUserById);

router.delete("/users/:id", protect, checkRole("admin"), deleteUser);
router.put("/users/:id", protect, checkRole("admin"), updateUserRole);

export default router;
