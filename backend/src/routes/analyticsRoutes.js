const express = require("express");
const jwt = require("jsonwebtoken");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try { const d = jwt.verify(token, process.env.JWT_SECRET); req.user=d.id; req.role=d.role; next(); } catch { return res.status(401).json({ error: "Invalid token" }); }
};
const admin = (req, res, next) => req.role === "admin" ? next() : res.status(403).json({ error: "Admins only" });

router.get("/overview", auth, admin, async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const totalRSVPs = await RSVP.countDocuments();
  const byStatus = await RSVP.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  res.json({ totalEvents, totalRSVPs, byStatus });
});

module.exports = router;






