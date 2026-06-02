import express from "express";
import {
  getAllUsers, getUserById, deleteUser, updateUserRole, toggleUserBlock,
  getAllOwners,
  getAllHostels, toggleHostelBlock, adminUpdateHostel, adminDeleteHostel,
  getAllBookings, forceCancelBooking,
  getAllConversations,
} from "../controllers/adminController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
const admin  = [protect, checkRole("admin")];

// Users
router.get("/users",              ...admin, getAllUsers);
router.get("/users/:id",          ...admin, getUserById);
router.delete("/users/:id",       ...admin, deleteUser);
router.put("/users/:id",          ...admin, updateUserRole);
router.patch("/users/:id/block",  ...admin, toggleUserBlock);

// Owners
router.get("/owners",             ...admin, getAllOwners);
router.patch("/owners/:id/block", ...admin, toggleUserBlock);
router.delete("/owners/:id",      ...admin, deleteUser);

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

export default router;
