import Notification from "../models/Notification.js";
import { getIO } from "./socket.service.js";

// ── Templates ──────────────────────────────────────────────────────────────────
// Each template defines getTitle, getMessage, and getLink from a `data` payload.
const TEMPLATES = {
  BOOKING_REQUEST: {
    getTitle:   ()     => "New Booking Request",
    getMessage: (d)    => `${d.guestName} requested to book ${d.hostelName}`,
    getLink:    ()     => "/hostel_owner/bookings",
  },
  BOOKING_ACCEPTED: {
    getTitle:   ()     => "Booking Accepted",
    getMessage: (d)    => `Your booking at ${d.hostelName} has been accepted`,
    getLink:    ()     => "/user/my-bookings",
  },
  BOOKING_REJECTED: {
    getTitle:   ()     => "Booking Rejected",
    getMessage: (d)    => `Your booking at ${d.hostelName} was rejected`,
    getLink:    ()     => "/user/my-bookings",
  },
  PAYMENT_SUBMITTED: {
    getTitle:   ()     => "Payment Receipt Submitted",
    getMessage: (d)    => `A student submitted a ${d.method || "manual"} receipt for ${d.hostelName}`,
    getLink:    ()     => "/hostel_owner/bookings",
  },
  PAYMENT_VERIFIED: {
    getTitle:   ()     => "Seat Reserved",
    getMessage: (d)    => `Your payment for ${d.hostelName} is verified. Your seat is reserved!`,
    getLink:    ()     => "/user/my-bookings",
  },
  PAYMENT_REJECTED: {
    getTitle:   ()     => "Payment Rejected",
    getMessage: (d)    => `Your payment for ${d.hostelName} was rejected. Please re-upload your receipt.`,
    getLink:    ()     => "/user/my-bookings",
  },
};

// ── Emit helper ────────────────────────────────────────────────────────────────
const emit = (receiverId, notification, extra = {}) => {
  try {
    getIO().to(receiverId.toString()).emit("notification:new", {
      ...notification.toObject?.() ?? notification,
      ...extra,
    });
  } catch (_) {
    // Socket not available — silently skip real-time emit
  }
};

// ── notify() — standard single notification ────────────────────────────────────
export const notify = async ({ type, receiverId, senderId = null, entityId = null, metadata = {}, data = {} }) => {
  try {
    const tpl = TEMPLATES[type];
    if (!tpl) { console.error(`Unknown notification type: ${type}`); return; }

    const notification = await Notification.create({
      receiverId,
      senderId,
      type,
      title:    tpl.getTitle(data),
      message:  tpl.getMessage(data),
      entityId,
      link:     tpl.getLink(data),
      metadata,
    });

    emit(receiverId, notification, { isNew: true });
    return notification;
  } catch (err) {
    console.error("notificationService.notify error:", err.message);
  }
};

// ── notifyNewMessage() — anti-spam aggregated chat notification ─────────────────
// Rule: one document per (receiver, conversation, unread).
// If one already exists, increment its count; otherwise create new.
export const notifyNewMessage = async ({ receiverId, senderId, conversationId, senderName, link }) => {
  try {
    const existing = await Notification.findOne({
      receiverId,
      type: "NEW_MESSAGE",
      entityId: conversationId,
      isRead: false,
    });

    let notification;
    let isNew = false;

    if (existing) {
      const count = (existing.metadata?.count || 1) + 1;
      existing.message  = `You have ${count} new message${count > 1 ? "s" : ""} from ${senderName}`;
      existing.metadata = { ...existing.metadata, count };
      existing.senderId = senderId;
      await existing.save();
      notification = existing;
    } else {
      notification = await Notification.create({
        receiverId,
        senderId,
        type:     "NEW_MESSAGE",
        title:    "New Message",
        message:  `You have 1 new message from ${senderName}`,
        entityId: conversationId,
        link,
        metadata: { count: 1 },
      });
      isNew = true;
    }

    emit(receiverId, notification, { isNew });
    return notification;
  } catch (err) {
    console.error("notifyNewMessage error:", err.message);
  }
};

// ── clearChatNotifications() — called when user opens a conversation ────────────
export const clearChatNotifications = async ({ receiverId, conversationId }) => {
  try {
    await Notification.updateMany(
      { receiverId, type: "NEW_MESSAGE", entityId: conversationId, isRead: false },
      { isRead: true }
    );
  } catch (err) {
    console.error("clearChatNotifications error:", err.message);
  }
};
