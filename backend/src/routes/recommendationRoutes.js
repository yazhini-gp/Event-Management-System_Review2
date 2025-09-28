const express = require("express");
const jwt = require("jsonwebtoken");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP");

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try { const d = jwt.verify(token, process.env.JWT_SECRET); req.user=d.id; next(); } catch { return res.status(401).json({ error: "Invalid token" }); }
};

// Simple recommendations: upcoming events the user hasn't RSVP'd 'going' to or registered for
router.get("/", auth, async (req, res) => {
  try {
    const now = new Date();
    const going = await RSVP.find({ user: req.user, status: "going" }).distinct("event");
    const events = await Event.find({ startAt: { $gte: now }, registeredUsers: { $ne: req.user } })
      .sort({ startAt: 1 })
      .limit(10);
    const filtered = events.filter(e => !going.find(id => String(id) === String(e._id)));
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;





