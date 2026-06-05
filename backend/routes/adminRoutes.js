import express from "express";
import {
  adminCreateUser, changeUserRole,
  getAllUsers, getUserById, deleteUser, updateUserRole, toggleUserBlock,
  adminEditUser, adminResetPassword,
  getAllOwners,
  getAllHostels, toggleHostelBlock, adminUpdateHostel, adminDeleteHostel,
  getAllBookings, forceCancelBooking,
  getAllConversations,
} from "../controllers/adminController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
const admin  = [protect, checkRole("admin")];

// Users
router.post("/users",                   ...admin, adminCreateUser);
router.get("/users",                    ...admin, getAllUsers);
router.get("/users/:id",               ...admin, getUserById);
router.delete("/users/:id",            ...admin, deleteUser);
router.put("/users/:id",               ...admin, updateUserRole);
router.patch("/users/:id/role",           ...admin, changeUserRole);
router.patch("/users/:id/block",          ...admin, toggleUserBlock);
router.patch("/users/:id/edit",           ...admin, adminEditUser);
router.patch("/users/:id/reset-password", ...admin, adminResetPassword);

// Owners
router.get("/owners",                       ...admin, getAllOwners);
router.patch("/owners/:id/block",           ...admin, toggleUserBlock);
router.patch("/owners/:id/edit",            ...admin, adminEditUser);
router.patch("/owners/:id/reset-password",  ...admin, adminResetPassword);
router.delete("/owners/:id",                ...admin, deleteUser);

// Hostels
router.get("/hostels",               ...admin, getAllHostels);
router.patch("/hostels/:id/block",   ...admin, toggleHostelBlock);
router.put("/hostels/:id",           ...admin, adminUpdateHostel);
router.delete("/hostels/:id",        ...admin, adminDeleteHostel);

// Bookings
router.get("/bookings",                    ...admin, getAllBookings);
router.patch("/bookings/:id/force-cancel", ...admin, forceCancelBooking);

// Chats
router.get("/conversations", ...admin, getAllConversations);

// Settings
router.get("/settings", ...admin, getSettings);
router.put("/settings", ...admin, updateSettings);

export default router;
