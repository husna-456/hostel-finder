// backend/email/templates.js
// Structured template data — NO raw HTML here.
// Each template is a function (data) => payload object consumed by renderEmail().
// To add a new type: copy any entry, change the fields, done.

const BASE_URL = process.env.CLIENT_URL || "https://hostel-finder-tan.vercel.app";

const fmt = (amount) => (amount ? `PKR ${Number(amount).toLocaleString()}` : "—");

// ── Template map ──────────────────────────────────────────────────────────────
export const TEMPLATES = {

  // Guest receives: booking request was submitted
  BOOKING_RECEIVED: (d) => ({
    subject:   `Booking Request Received — ${d.hostelName}`,
    preheader: `Your request for ${d.hostelName} is under review`,
    heading:   "Booking Request Received",
    greeting:  `Hi ${d.userName}`,
    body:      `Your booking request for <strong>${d.hostelName}</strong> has been received and is currently <strong style="color:#f59e0b;">pending review</strong>. You will be notified as soon as the owner responds.`,
    details: [
      { label: "Hostel",    value: d.hostelName },
      { label: "Room Type", value: d.roomType || "Any" },
      { label: "People",    value: d.people },
      { label: "Status",    value: "Pending Review" },
    ],
    cta:  { text: "View My Bookings", href: `${BASE_URL}/user/my-bookings` },
    note: "This process usually takes less than 24 hours.",
  }),

  // Owner receives: new booking request
  BOOKING_REQUEST: (d) => ({
    subject:   `New Booking Request — ${d.hostelName}`,
    preheader: `${d.guestName} wants to book ${d.hostelName}`,
    heading:   "New Booking Request",
    greeting:  `Hi ${d.userName}`,
    body:      `<strong>${d.guestName}</strong> has submitted a booking request for <strong>${d.hostelName}</strong>. Please review and respond at your earliest convenience.`,
    details: [
      { label: "Guest Name", value: d.guestName },
      { label: "Contact",    value: d.contactNo },
      { label: "People",     value: d.people },
      { label: "Room Type",  value: d.roomType || "Any" },
    ],
    cta:  { text: "Review Booking", href: `${BASE_URL}/hostel_owner/bookings` },
    note: "Responding quickly improves your hostel's visibility on the platform.",
  }),

  // Guest receives: owner accepted their booking
  BOOKING_ACCEPTED: (d) => ({
    subject:   `Booking Accepted — ${d.hostelName} \u{1F389}`,
    preheader: `Great news! Your booking at ${d.hostelName} was accepted`,
    heading:   "Your Booking Was Accepted!",
    greeting:  `Hi ${d.userName}`,
    body:      `The owner has <strong style="color:#10b981;">accepted</strong> your booking request for <strong>${d.hostelName}</strong>. Complete your payment to officially reserve your seat.`,
    details: [
      { label: "Hostel", value: d.hostelName },
      { label: "Status", value: "Accepted ✅" },
    ],
    cta:  { text: "Proceed to Payment", href: `${BASE_URL}/user/my-bookings` },
    note: "Complete your payment promptly to secure your spot before it is taken by someone else.",
  }),

  // Guest receives: owner rejected their booking
  BOOKING_REJECTED: (d) => ({
    subject:   `Booking Update — ${d.hostelName}`,
    preheader: `Update regarding your booking at ${d.hostelName}`,
    heading:   "Booking Not Accepted",
    greeting:  `Hi ${d.userName}`,
    body:      `Unfortunately, the owner was unable to accept your booking request for <strong>${d.hostelName}</strong> at this time.`,
    details: [
      { label: "Hostel", value: d.hostelName },
      { label: "Status", value: "Not Accepted" },
    ],
    cta:  { text: "Explore Other Hostels", href: `${BASE_URL}/hostels` },
    note: "There are many great hostels available. Browse alternatives and find your perfect match.",
  }),

  // Guest receives: card payment processed (before owner verification)
  PAYMENT_RECEIVED: (d) => ({
    subject:   `Payment Received — ${d.hostelName}`,
    preheader: `Your card payment for ${d.hostelName} was received`,
    heading:   "Payment Received",
    greeting:  `Hi ${d.userName}`,
    body:      `Your card payment for <strong>${d.hostelName}</strong> has been successfully processed. The owner will review and confirm your seat shortly.`,
    details: [
      { label: "Hostel",  value: d.hostelName },
      { label: "Amount",  value: fmt(d.amount) },
      { label: "Method",  value: "Card (Stripe)" },
      { label: "Status",  value: "Awaiting Owner Confirmation" },
    ],
    cta:  { text: "View Booking", href: `${BASE_URL}/user/my-bookings` },
    note: "You will receive another email once the owner confirms your reservation.",
  }),

  // Owner receives: student submitted a manual or card payment
  PAYMENT_SUBMITTED: (d) => ({
    subject:   `Payment Receipt Submitted — ${d.hostelName}`,
    preheader: `A student submitted a ${d.method} receipt — action required`,
    heading:   "Payment Receipt Awaiting Verification",
    greeting:  `Hi ${d.userName}`,
    body:      `A student submitted a <strong>${d.method || "manual"}</strong> payment receipt for <strong>${d.hostelName}</strong>. Please verify the receipt to reserve their seat.`,
    details: [
      { label: "Hostel", value: d.hostelName },
      { label: "Method", value: d.method },
      { label: "Amount", value: fmt(d.amount) },
    ],
    cta:  { text: "Verify Payment", href: `${BASE_URL}/hostel_owner/bookings` },
    note: "Verifying quickly ensures the student can confirm their accommodation.",
  }),

  // Guest receives: payment verified, seat is confirmed
  PAYMENT_VERIFIED: (d) => ({
    subject:   `Seat Confirmed — ${d.hostelName} ✅`,
    preheader: `Your seat at ${d.hostelName} is now officially reserved`,
    heading:   "Your Seat is Reserved!",
    greeting:  `Hi ${d.userName}`,
    body:      `Congratulations! Your payment has been verified and your seat at <strong>${d.hostelName}</strong> is now officially <strong style="color:#10b981;">confirmed</strong>.`,
    details: [
      { label: "Hostel",      value: d.hostelName },
      { label: "Amount Paid", value: fmt(d.amount) },
      { label: "Method",      value: d.method || "—" },
      { label: "Status",      value: "Confirmed ✅" },
    ],
    cta:  { text: "View My Booking", href: `${BASE_URL}/user/my-bookings` },
    note: "Welcome to your new hostel! Contact us if you have any questions.",
  }),

  // Guest receives: payment rejected by owner
  PAYMENT_REJECTED: (d) => ({
    subject:   `Payment Update — ${d.hostelName}`,
    preheader: `Action required: your payment for ${d.hostelName} could not be verified`,
    heading:   "Payment Could Not Be Verified",
    greeting:  `Hi ${d.userName}`,
    body:      d.rejectionReason
      ? `Your payment for <strong>${d.hostelName}</strong> could not be verified for the following reason:<br/><br/><span style="color:#dc2626;font-weight:600;">${d.rejectionReason}</span>`
      : `Your payment for <strong>${d.hostelName}</strong> could not be verified at this time.`,
    details: [
      { label: "Hostel", value: d.hostelName },
      { label: "Status", value: "Rejected ❌" },
    ],
    cta:  { text: "Re-Upload Receipt", href: `${BASE_URL}/user/my-bookings` },
    note: "Please re-upload a clear, valid payment receipt. Contact us if you need assistance.",
  }),

  // Receiver gets: aggregated unread messages digest (anti-spam)
  NEW_MESSAGE: (d) => ({
    subject:   d.count > 1
      ? `${d.count} new messages from ${d.senderName}`
      : `New message from ${d.senderName}`,
    preheader: `${d.senderName} sent you ${d.count > 1 ? `${d.count} messages` : "a message"} while you were away`,
    heading:   d.count > 1 ? `You have ${d.count} unread messages` : "You have a new message",
    greeting:  `Hi ${d.userName}`,
    body:      `<strong>${d.senderName}</strong> sent you ${d.count > 1 ? `<strong>${d.count} messages</strong>` : "a message"} while you were away.`,
    details:   [],
    cta:       { text: "Open Chat", href: d.conversationLink || `${BASE_URL}/user/chat` },
    note:      "We won’t send another email for this conversation for the next few minutes to avoid overloading your inbox.",
  }),
};
