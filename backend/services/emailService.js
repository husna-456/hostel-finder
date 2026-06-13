// backend/services/emailService.js
// Orchestrates email delivery for every notification type.
// Only scheduleEmail() and scheduleMessageEmail() are public.
// All decisions (user prefs, anti-spam, rendering) happen here — controllers
// and notificationService call these two functions and nothing else.

import User         from "../models/User.js";
import Notification from "../models/Notification.js";
import transporter  from "../config/nodemailer.js";
import { renderTextEmail } from "../email/layout.js";
import { TEMPLATES }   from "../email/templates.js";
import { enqueue }     from "./emailQueue.js";

// ── Category → user preference key ───────────────────────────────────────────
const PREF_CATEGORY = {
  BOOKING_RECEIVED:  "bookings",
  BOOKING_REQUEST:   "bookings",
  BOOKING_ACCEPTED:  "bookings",
  BOOKING_REJECTED:  "bookings",
  PAYMENT_RECEIVED:  "payments",
  PAYMENT_SUBMITTED: "payments",
  PAYMENT_VERIFIED:  "payments",
  PAYMENT_REJECTED:  "payments",
  NEW_MESSAGE:       "messages",
};

// ── Preference check ──────────────────────────────────────────────────────────
const isEnabled = (user, type) => {
  const category = PREF_CATEGORY[type];
  if (!category) return false;
  // emailNotifications may not exist on legacy users — treat as enabled
  return user.emailNotifications?.[category] !== false;
};

// ── Core render + send ────────────────────────────────────────────────────────
// Sends text-only emails: no HTML, no tracking pixels, no heavy markup.
// Text-only messages score better with spam filters when sent via a shared
// sender domain (onboarding@resend.dev) where domain reputation is pooled.
const deliver = async (receiverEmail, type, data) => {
  const templateFn = TEMPLATES[type];
  if (!templateFn) {
    throw new Error(`No email template registered for notification type: "${type}"`);
  }

  const payload = templateFn(data);
  const text    = renderTextEmail(payload);

  const logMeta = {
    to:        receiverEmail,
    subject:   payload.subject,
    type,
    timestamp: new Date().toISOString(),
  };

  const result = await transporter.sendMail({
    to:      receiverEmail,
    subject: payload.subject,
    text,
  });

  console.log(`[email] delivered`, { ...logMeta, id: result?.id });
};

// ── Anti-spam cooldown for messages ──────────────────────────────────────────
const MSG_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// ── scheduleEmail — standard notifications ────────────────────────────────────
export const scheduleEmail = (type, receiverId, data) => {
  enqueue(async () => {
    console.log(`[email] ▶ ${type} | receiver: ${receiverId}`);

    // 1. Look up receiver
    const user = await User.findById(receiverId)
      .select("name email emailNotifications")
      .lean();

    if (!user) {
      console.warn(`[email] ✗ ${type}: receiver not found (${receiverId})`);
      return;
    }
    if (!user.email) {
      console.warn(`[email] ✗ ${type}: receiver has no email address (${receiverId})`);
      return;
    }

    // 2. Check user preference
    if (!isEnabled(user, type)) {
      const cat = PREF_CATEGORY[type];
      console.log(`[email] ✗ ${type}: blocked — user disabled "${cat}" emails (${user.email})`);
      return;
    }

    // 3. Deliver
    await deliver(user.email, type, { userName: user.name, ...data });
  });
};

// ── scheduleMessageEmail — anti-spam chat digest ──────────────────────────────
export const scheduleMessageEmail = (receiverId, senderName, notification) => {
  enqueue(async () => {
    console.log(`[email] ▶ NEW_MESSAGE digest | receiver: ${receiverId} | sender: ${senderName}`);

    // 1. Look up receiver
    const user = await User.findById(receiverId)
      .select("name email emailNotifications isOnline")
      .lean();

    if (!user) {
      console.warn(`[email] ✗ NEW_MESSAGE: receiver not found (${receiverId})`);
      return;
    }
    if (!user.email) {
      console.warn(`[email] ✗ NEW_MESSAGE: receiver has no email (${receiverId})`);
      return;
    }

    // 2. User preference
    if (!isEnabled(user, "NEW_MESSAGE")) {
      console.log(`[email] ✗ NEW_MESSAGE: user disabled message emails (${user.email})`);
      return;
    }

    // 3. Online check — active users don't need email
    if (user.isOnline) {
      console.log(`[email] ✗ NEW_MESSAGE: user is online, skipping digest (${user.email})`);
      return;
    }

    // 4. Cooldown check
    const lastSent = notification.metadata?.lastEmailSentAt;
    if (lastSent) {
      const elapsed = Date.now() - new Date(lastSent).getTime();
      if (elapsed < MSG_COOLDOWN_MS) {
        const remaining = Math.round((MSG_COOLDOWN_MS - elapsed) / 1000);
        console.log(`[email] ✗ NEW_MESSAGE: cooldown active (${remaining}s left) for ${user.email}`);
        return;
      }
    }

    // 5. Deliver digest
    const count = notification.metadata?.count || 1;
    const link  = `${process.env.CLIENT_URL || ""}${notification.link || "/user/chat"}`;

    await deliver(user.email, "NEW_MESSAGE", {
      userName:         user.name,
      senderName,
      count,
      conversationLink: link,
    });

    // 6. Persist cooldown timestamp
    await Notification.findByIdAndUpdate(notification._id, {
      $set: { "metadata.lastEmailSentAt": new Date() },
    });
  });
};
