import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Hostel } from "../models/Hostel.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

// Helper: last N months as { label, start, end }[] newest-last
function lastNMonths(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      label: d.toLocaleString("en-US", { month: "short" }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  });
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [bookings, payments] = await Promise.all([
      Booking.find({ userId }).populate("hostelId", "name images address startingRent").sort({ createdAt: -1 }),
      Payment.find({ userId, status: { $in: ["paid", "verified"] } }),
    ]);

    const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const stats = {
      total:     bookings.length,
      accepted:  bookings.filter(b => b.status === "accepted" || b.status === "reserved").length,
      pending:   bookings.filter(b => b.status === "pending").length,
      cancelled: bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length,
      totalPaid,
    };

    const months = lastNMonths(6);
    const chartData = months.map(({ label, start, end }) => ({
      month: label,
      bookings: bookings.filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) <= end).length,
    }));

    res.json({
      user: { name: req.user.name, email: req.user.email },
      stats,
      recentBookings: bookings.slice(0, 4),
      chartData,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── OWNER DASHBOARD ──────────────────────────────────────────────────────────
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const hostels = await Hostel.find({ ownerId }).select("_id name");
    const hostelIds = hostels.map(h => h._id);

    const [bookings, payments] = await Promise.all([
      Booking.find({ hostelId: { $in: hostelIds } })
        .populate("hostelId", "name")
        .populate("userId", "name email")
        .sort({ createdAt: -1 }),
      Payment.find({ ownerId }),
    ]);

    const revenue = payments
      .filter(p => p.status === "paid" || p.status === "verified")
      .reduce((s, p) => s + (p.amount || 0), 0);

    const stats = {
      totalHostels:  hostels.length,
      totalBookings: bookings.length,
      pending:       bookings.filter(b => b.status === "pending").length,
      accepted:      bookings.filter(b => b.status === "accepted").length,
      rejected:      bookings.filter(b => b.status === "rejected").length,
      reserved:      bookings.filter(b => b.status === "reserved").length,
      awaitingVerification: payments.filter(p => p.status === "pending_verification").length,
      revenue,
    };

    const months = lastNMonths(6);
    const chartData = months.map(({ label, start, end }) => ({
      month: label,
      bookings: bookings.filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) <= end).length,
    }));

    // Per-hostel booking counts
    const hostelStats = hostels.map(h => ({
      name: h.name,
      bookings: bookings.filter(b => b.hostelId?._id?.toString() === h._id.toString()).length,
    })).sort((a, b) => b.bookings - a.bookings);

    const pendingPayments = await Payment.find({ ownerId, status: "pending_verification" })
      .populate({ path: "bookingId", populate: { path: "userId", select: "name email" } })
      .populate("hostelId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats,
      recentBookings: bookings.slice(0, 5),
      chartData,
      hostelStats,
      pendingPayments,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export const getAdminDashboard = async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [users, owners, hostels, bookings, payments, conversations] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "hostel_owner" }),
      Hostel.countDocuments(),
      Booking.find().sort({ createdAt: -1 }),
      Payment.find({ status: { $in: ["paid", "verified"] } }),
      Conversation.countDocuments(),
    ]);

    const revenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const todayBookings = bookings.filter(b => new Date(b.createdAt) >= todayStart && new Date(b.createdAt) <= todayEnd).length;

    const stats = {
      users, owners, hostels,
      totalBookings: bookings.length,
      pending:       bookings.filter(b => b.status === "pending").length,
      accepted:      bookings.filter(b => b.status === "accepted").length,
      cancelled:     bookings.filter(b => b.status === "cancelled").length,
      reserved:      bookings.filter(b => b.status === "reserved").length,
      conversations,
      todayBookings,
      revenue,
    };

    // Weekly chart (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      return {
        day: d.toLocaleString("en-US", { weekday: "short" }),
        bookings: bookings.filter(b => new Date(b.createdAt) >= d && new Date(b.createdAt) <= end).length,
      };
    });

    // Monthly trend (last 6 months)
    const months = lastNMonths(6);
    const trendData = months.map(({ label, start, end }) => ({
      month: label,
      bookings:      bookings.filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) <= end).length,
      cancellations: bookings.filter(b => ["cancelled", "rejected"].includes(b.status) && new Date(b.createdAt) >= start && new Date(b.createdAt) <= end).length,
    }));

    // Top hostels by booking count
    const hostelBookingMap = {};
    bookings.forEach(b => {
      const id = b.hostelId?.toString();
      if (id) hostelBookingMap[id] = (hostelBookingMap[id] || 0) + 1;
    });
    const topHostelIds = Object.entries(hostelBookingMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
    const topHostelDocs = await Hostel.find({ _id: { $in: topHostelIds } }).select("name");
    const topHostels = topHostelDocs.map(h => ({
      name: h.name,
      bookings: hostelBookingMap[h._id.toString()] || 0,
    })).sort((a, b) => b.bookings - a.bookings);

    // Acceptance vs rejection rate
    const accepted  = bookings.filter(b => b.status === "accepted" || b.status === "reserved").length;
    const rejected  = bookings.filter(b => b.status === "rejected").length;
    const total     = accepted + rejected || 1;
    const pieData   = [
      { name: "Accepted", value: Math.round((accepted / total) * 100) },
      { name: "Rejected", value: Math.round((rejected / total) * 100) },
    ];

    // Recent signups
    const recentUsers = await User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).select("name email createdAt");

    res.json({ stats, weeklyData, trendData, topHostels, pieData, recentUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Keep old profile route for compatibility
export const getDashboardData = (req, res) => {
  res.json({ message: `Welcome ${req.user.name}`, user: req.user });
};
