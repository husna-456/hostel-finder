import express from "express";
import {
  createPaymentIntent,
  confirmBooking,
  createStripeSession,
  stripeWebhook,
  manualPayment,
  getPaymentByBooking,
  getMyPayments,
  verifyPayment,
  rejectPayment
} from "../controllers/paymentController.js";
import { protect, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stripe webhook — raw body, no auth
router.post("/webhook", stripeWebhook);

// PaymentIntent-based flow (for custom card element on frontend)
router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/confirm-booking", protect, confirmBooking);

// Checkout Session flow (for Stripe hosted checkout page)
router.post("/stripe-session", protect, createStripeSession);

// Manual payments (JazzCash / EasyPaisa)
router.post("/manual", protect, manualPayment);
router.get("/my-payments", protect, getMyPayments);
router.get("/booking/:bookingId", protect, getPaymentByBooking);
router.patch("/:paymentId/verify", protect, verifyPayment);
router.patch("/:paymentId/reject", protect, rejectPayment);

export default router;
