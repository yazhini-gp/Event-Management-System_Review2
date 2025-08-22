const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// connect DB
connectDB();

// routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "event-api" });
});

// start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
