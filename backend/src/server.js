const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
// Trust proxy so express-rate-limit can correctly parse X-Forwarded-For when present
app.set("trust proxy", 1);
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 })); // Increased limit temporarily
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// connect DB
connectDB();

// routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const rsvpRoutes = require("./routes/rsvpRoutes");
const signatureRoutes = require("./routes/signatureRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const realtimeRoutes = require("./routes/realtimeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/rsvps", rsvpRoutes);
app.use("/api/signature", signatureRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", recommendationRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "event-api" });
});

// start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// start background workers
const { startReminderWorker } = require("./workers/reminderWorker");
startReminderWorker();
