import express from "express";
import { createBooking,getBookings,getOwnerBookings,getUserBookings,updateBookingStatus, cancelBooking,getSingleBooking,markBookingCompleted} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);

// USER
router.get("/user", protect, getUserBookings);
router.get("/my", protect, getUserBookings);

// OWNER
router.get("/owner", protect, getOwnerBookings);
router.patch("/:id/status", protect, updateBookingStatus);
router.patch("/:id/complete", protect, markBookingCompleted);
router.get("/:id", getSingleBooking);

// NOT NEEDED for user
router.get("/hostel/:hostelId", protect, getBookings);
router.delete("/cancel/:bookingId", protect, cancelBooking);




export default router;
