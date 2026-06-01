// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check if token exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token found
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Role-based Access (Single Role)
export const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Access denied for ${role}` });
    }
    next();
  };
};
