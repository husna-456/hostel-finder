import jwt from "jsonwebtoken";
import Settings from "../models/Settings.js";

// Simple in-process cache: refresh after 30 seconds
let cached = null;
let cachedAt = 0;

export const refreshMaintenanceCache = () => { cached = null; cachedAt = 0; };

export const maintenanceGuard = async (req, res, next) => {
  // Always allow auth routes, admin routes, settings routes, health check, and Stripe webhook
  const PASS = ["/api/auth", "/api/admin", "/api/settings", "/api/health", "/api/payments/webhook", "/api/payment/webhook"];
  if (PASS.some(p => req.path.startsWith(p))) return next();

  try {
    // Re-fetch at most once every 30 seconds
    if (!cached || Date.now() - cachedAt > 30_000) {
      let s = await Settings.findOne().lean();
      if (!s) s = { maintenanceMode: false };
      cached = s;
      cachedAt = Date.now();
    }

    if (!cached.maintenanceMode) return next();

    // Maintenance is ON — still allow admins through
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        if (decoded?.role === "admin") return next();
      } catch (_) {}
    }

    return res.status(503).json({
      message: "The site is currently under maintenance. Please check back soon.",
      maintenanceMode: true,
    });
  } catch (_) {
    // If settings lookup fails, don't block — just continue
    next();
  }
};
