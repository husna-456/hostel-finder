import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { Hostel } from "../models/Hostel.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import transporter from "../config/nodemailer.js";

// ── CREATE USER (admin) ───────────────────────────────────────────────────────
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["user", "hostel_owner"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'hostel_owner'" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role, isVerified: true });

    // Fire-and-forget: email the new user their credentials
    try {
      transporter.sendMail({
        to: email,
        subject: "Your Hostel Finder Account",
        html: `<h2>Account Created</h2><p>Hi ${name},</p><p>An admin has created a <strong>${role}</strong> account for you on Hostel Finder.</p><ul><li>Email: ${email}</li><li>Password: ${password}</li></ul><p>Please log in and change your password.</p>`,
      });
    } catch (_) {}

    res.status(201).json({ message: "User created successfully", user: { _id: user._id, name, email, role, isVerified: true, isBlocked: false, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── CHANGE USER ROLE ─────────────────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "hostel_owner", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `Role changed to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── OWNERS ────────────────────────────────────────────────────────────────────
export const getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: "hostel_owner" }).sort({ createdAt: -1 }).select("-password");

    const enriched = await Promise.all(owners.map(async (owner) => {
      const hostels   = await Hostel.find({ ownerId: owner._id }).select("_id");
      const hostelIds = hostels.map(h => h._id);
      const bookings  = await Booking.find({ hostelId: { $in: hostelIds } });
      const accepted  = bookings.filter(b => b.status === "accepted" || b.status === "reserved").length;
      const total     = bookings.length;
      return {
        ...owner.toObject(),
        hostelCount:    hostels.length,
        totalBookings:  total,
        acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── HOSTELS ───────────────────────────────────────────────────────────────────
export const getAllHostels = async (req, res) => {
  try {
    const hostels  = await Hostel.find().populate("ownerId", "name email").sort({ createdAt: -1 });
    const bookings = await Booking.find().select("hostelId");

    const enriched = hostels.map(h => {
      const bookingCount  = bookings.filter(b => b.hostelId?.toString() === h._id.toString()).length;
      const totalSeats    = (h.rooms || []).reduce((s, r) => s + (r.totalSeats || 0), 0);
      const reservedSeats = (h.rooms || []).reduce((s, r) => s + (r.reservedSeats || 0), 0);
      return { ...h.toObject(), bookingCount, totalSeats, availableSeats: totalSeats - reservedSeats };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const toggleHostelBlock = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    hostel.isBlocked = !hostel.isBlocked;
    await hostel.save();
    res.json({ message: `Hostel ${hostel.isBlocked ? "blocked" : "unblocked"}`, isBlocked: hostel.isBlocked });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const adminUpdateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    res.json({ message: "Hostel updated", hostel });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const adminDeleteHostel = async (req, res) => {
  try {
    await Booking.updateMany(
      { hostelId: req.params.id, status: { $in: ["pending", "accepted"] } },
      { $set: { status: "cancelled" } }
    );
    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ message: "Hostel deleted and related bookings cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId",   "name email")
      .populate("hostelId", "name")
      .sort({ createdAt: -1 });

    const payments = await Payment.find().select("bookingId amount status");
    const payMap   = {};
    payments.forEach(p => { payMap[p.bookingId?.toString()] = p; });

    const enriched = bookings.map(b => {
      const pay = payMap[b._id.toString()];
      return { ...b.toObject(), paymentAmount: pay?.amount || null, paymentStatusDetail: pay?.status || null };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const forceCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking force-cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("clientId", "name email")
      .populate("ownerId",  "name email")
      .populate("hostelId", "name")
      .sort({ updatedAt: -1 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const enriched = await Promise.all(conversations.map(async (c) => {
      const msgs = await Message.find({ conversationId: c._id })
        .sort({ createdAt: 1 })
        .limit(20)
        .populate("senderId", "name role");
      return {
        ...c.toObject(),
        messageCount:   msgs.length,
        recentMessages: msgs,
        isActive:       msgs.some(m => new Date(m.createdAt) >= sevenDaysAgo),
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
