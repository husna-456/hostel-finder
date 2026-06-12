// backend/routes/debugRoutes.js
// Isolated email diagnostics — lets you verify the entire email pipeline
// without triggering a real booking/payment event.
//
// All endpoints require a logged-in user (protect middleware).
// Remove or guard this file before shipping to production if preferred.

import express from "express";
import transporter from "../config/nodemailer.js";
import { renderEmail } from "../email/layout.js";
import { TEMPLATES } from "../email/templates.js";
import { scheduleEmail } from "../services/emailService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── 1. Direct provider test ───────────────────────────────────────────────────
// Bypasses all application logic — calls Mailjet directly.
// Use this first. If it fails, the issue is in the provider config.
// If it succeeds, the issue is somewhere in the application pipeline.
//
// GET /api/debug/test-email
// Sends to the logged-in user's own email address.
router.get("/test-email", protect, async (req, res) => {
  const targetEmail = req.user.email;
  const userName    = req.user.name;

  console.log(`[debug] Direct email test → ${targetEmail}`);
  console.log(`[debug] ENV check: MAILJET_API_KEY=${process.env.MAILJET_API_KEY ? "SET" : "MISSING"}, MAILJET_SECRET_KEY=${process.env.MAILJET_SECRET_KEY ? "SET" : "MISSING"}, EMAIL=${process.env.EMAIL || "(not set)"}`);

  try {
    const payload = TEMPLATES.BOOKING_RECEIVED({
      userName,
      hostelName: "Test Hostel",
      roomType: "Double Room",
      people: 2,
    });
    const html = renderEmail(payload);
    await transporter.sendMail({ to: targetEmail, subject: `[TEST] ${payload.subject}`, html });

    console.log(`[debug] ✓ Direct test email sent to ${targetEmail}`);
    return res.json({
      success: true,
      message: `Test email sent to ${targetEmail}. Check your inbox (and spam folder).`,
      emailAddress: targetEmail,
      mailjetApiKeySet: !!process.env.MAILJET_API_KEY,
      mailjetSecretKeySet: !!process.env.MAILJET_SECRET_KEY,
      fromEmail: process.env.EMAIL || "husnazaheer518@gmail.com",
    });
  } catch (err) {
    console.error(`[debug] ✗ Direct test failed:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      hint: "Check Railway logs for full details. Common causes: wrong Mailjet keys, sender not verified, or Mailjet rate limit.",
      mailjetApiKeySet: !!process.env.MAILJET_API_KEY,
      mailjetSecretKeySet: !!process.env.MAILJET_SECRET_KEY,
      fromEmail: process.env.EMAIL || "husnazaheer518@gmail.com",
    });
  }
});

// ── 2. Full pipeline test ─────────────────────────────────────────────────────
// Goes through the complete flow: scheduleEmail → emailQueue → emailService → Mailjet.
// Use this after the direct test succeeds, to verify the integration layer.
//
// GET /api/debug/test-pipeline
router.get("/test-pipeline", protect, async (req, res) => {
  const receiverId = req.user._id;
  const type       = "BOOKING_RECEIVED";

  console.log(`[debug] Pipeline test → type: ${type}, receiver: ${receiverId}`);

  scheduleEmail(type, receiverId, {
    hostelName: "Pipeline Test Hostel",
    roomType:   "Single",
    people:     1,
  });

  return res.json({
    success: true,
    message: `Email job queued via scheduleEmail(). Watch Railway logs for [email] trace lines.`,
    type,
    receiverId: String(receiverId),
    note: "If no [email] logs appear, the queue is not running. If logs appear but email fails, the error will be printed by emailQueue.",
  });
});

export default router;
