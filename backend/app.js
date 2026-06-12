// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Middleware
import { maintenanceGuard } from "./middleware/maintenanceMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import hostelRoutes from "./routes/hostelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import siteContentRoutes from "./routes/siteContentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";

const app = express();

// Stripe webhook: raw body MUST be before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hostel-finder-tan.vercel.app",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Maintenance mode guard (applied before all API routes)
app.use(maintenanceGuard);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/debug", debugRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

export default app;
