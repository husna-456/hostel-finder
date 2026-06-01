import jwt from "jsonwebtoken";

export default function verifySocketToken(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ALWAYS normalize user
    socket.user = {
      id: decoded.userId || decoded.id || decoded._id,
      role: decoded.role,
    };

    console.log("🔐 SOCKET USER:", socket.user);

    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
}
