const express = require("express");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const Invitation = require("../models/Invitation");
const Event = require("../models/Event");
const { sendEmail } = require("../services/email");

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

// Create and send invitations (basic create; email sending handled elsewhere)
router.post("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { emails } = req.body; // array of emails

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "emails array is required" });
    }

    const event = await Event.findOne({ _id: eventId, createdBy: req.user });
    if (!event) return res.status(404).json({ error: "Event not found or not authorized" });

    const invitations = await Promise.all(emails.map(async (email) => {
      const token = randomUUID();
      const inv = await Invitation.create({ event: eventId, email, token, sentAt: new Date() });
      const baseUrl = process.env.PUBLIC_WEB_URL || "http://localhost:3000";
      const link = `${baseUrl}/invite/${token}`;
      try {
        await sendEmail({
          to: email,
          subject: `Invitation: ${event.title}`,
          html: `<p>You are invited to <b>${event.title}</b>.</p><p>Date: ${event.startAt ? new Date(event.startAt).toLocaleString() : ""}</p><p><a href="${link}">Respond to invitation</a></p>`,
        });
      } catch (e) {
        console.error("Failed to send invite email", e.message);
      }
      return inv;
    }));

    res.json({ msg: "Invitations created", invitations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List invitations for an event (organizer only)
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, createdBy: req.user });
    if (!event) return res.status(404).json({ error: "Event not found or not authorized" });
    const invitations = await Invitation.find({ event: eventId });
    res.json(invitations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Respond to invitation via token
router.post("/respond/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body; // "accept" | "decline"
    const invitation = await Invitation.findOne({ token });
    if (!invitation) return res.status(404).json({ error: "Invitation not found" });
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    invitation.status = action === "accept" ? "accepted" : "declined";
    invitation.respondedAt = new Date();
    await invitation.save();
    res.json({ msg: "Response recorded", invitation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


