const express = require("express");
const jwt = require("jsonwebtoken");
const RSVP = require("../models/RSVP");
const Event = require("../models/Event");
const { broadcast } = require("../realtime/sse");

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Set or update RSVP for current user
router.post("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, note } = req.body;
    if (!status || !["going", "maybe", "not_going"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const rsvp = await RSVP.findOneAndUpdate(
      { event: eventId, user: req.user },
      { status, note },
      { upsert: true, new: true }
    );
    broadcast({ type: "rsvp:update", eventId, rsvp });
    res.json({ msg: "RSVP saved", rsvp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List RSVPs for an event (organizer only)
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, createdBy: req.user });
    if (!event) return res.status(404).json({ error: "Event not found or not authorized" });
    const rsvps = await RSVP.find({ event: eventId }).populate("user", "name email");
    const counts = rsvps.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    res.json({ rsvps, counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


