// backend/services/emailService.js
// Orchestrates email delivery for every notification type.
// Controllers and the notification service call only scheduleEmail() /
// scheduleMessageEmail() — everything else (templates, prefs, anti-spam) is
// handled internally.

import User         from "../models/User.js";
import Notification from "../models/Notification.js";
import transporter  from "../config/nodemailer.js";
import { renderEmail } from "../email/layout.js";
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

// ── Check user preference for a notification type ─────────────────────────────
const isEnabled = (user, type) => {
  const category = PREF_CATEGORY[type];
  if (!category) return false;
  return user.emailNotifications?.[category] !== false; // default: true
};

// ── Render and send one email ─────────────────────────────────────────────────
const deliver = async (receiverEmail, type, data) => {
  const templateFn = TEMPLATES[type];
  if (!templateFn) {
    console.warn(`[emailService] no template registered for type: ${type}`);
    return;
  }
  const payload = templateFn(data);
  const html    = renderEmail(payload);
  await transporter.sendMail({ to: receiverEmail, subject: payload.subject, html });
};

// ── Chat email cooldown ───────────────────────────────────────────────────────
const MSG_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// ── Public: schedule email for a standard notification ───────────────────────
// Called from notificationService.notify() — fire-and-forget, never throws.
export const scheduleEmail = (type, receiverId, data) => {
  enqueue(async () => {
    const user = await User.findById(receiverId)
      .select("name email emailNotifications")
      .lean();

    if (!user?.email)         return;
    if (!isEnabled(user, type)) return;

    await deliver(user.email, type, { userName: user.name, ...data });
  });
};

// ── Public: schedule aggregated message digest (anti-spam) ───────────────────
// Called from notificationService.notifyNewMessage() — fire-and-forget, never throws.
export const scheduleMessageEmail = (receiverId, senderName, notification) => {
  enqueue(async () => {
    const user = await User.findById(receiverId)
      .select("name email emailNotifications isOnline")
      .lean();

    if (!user?.email)                      return;
    if (!isEnabled(user, "NEW_MESSAGE"))   return;
    if (user.isOnline)                     return; // active — skip entirely

    // Cooldown: only one email per conversation per window
    const lastSent = notification.metadata?.lastEmailSentAt;
    if (lastSent && Date.now() - new Date(lastSent).getTime() < MSG_COOLDOWN_MS) return;

    const count = notification.metadata?.count || 1;
    const link  = `${process.env.CLIENT_URL || ""}${notification.link || "/user/chat"}`;

    await deliver(user.email, "NEW_MESSAGE", {
      userName:         user.name,
      senderName,
      count,
      conversationLink: link,
    });

    // Persist cooldown timestamp so subsequent calls respect the window
    await Notification.findByIdAndUpdate(notification._id, {
      $set: { "metadata.lastEmailSentAt": new Date() },
    });
  });
};
