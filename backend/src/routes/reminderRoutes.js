const express = require("express");
const jwt = require("jsonwebtoken");
const nodeCron = require("node-cron");
const Reminder = require("../models/Reminder");
const Event = require("../models/Event");

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

// Seed reminders for an event for all guests (24h and 1h before)
router.post("/seed/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, createdBy: req.user });
    if (!event) return res.status(404).json({ error: "Event not found or not authorized" });
    if (!event.startAt) return res.status(400).json({ error: "Event startAt is required" });

    const times = [24 * 60 * 60 * 1000, 60 * 60 * 1000];
    const reminders = [];
    for (const email of event.guests || []) {
      for (const ms of times) {
        const sendAt = new Date(new Date(event.startAt).getTime() - ms);
        if (sendAt > new Date()) {
          reminders.push({ event: event._id, recipient: email, sendAt });
        }
      }
    }
    const created = await Reminder.insertMany(reminders);
    res.json({ msg: "Reminders scheduled", count: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



