const express = require("express");
const jwt = require("jsonwebtoken");
const Event = require("../models/Event");

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // attach user ID to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Create Event
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, startAt, endAt, timezone, location, status, guests, category } = req.body;

    if (!title || !startAt) {
      return res.status(400).json({ error: "title and startAt are required" });
    }

    if (endAt && new Date(endAt) < new Date(startAt)) {
      return res.status(400).json({ error: "endAt cannot be before startAt" });
    }

    const event = new Event({
      title,
      description,
      startAt,
      endAt,
      timezone: timezone || "UTC",
      location,
      status: status || "published",
      createdBy: req.user,
      guests,
      category,
    });

    await event.save();
    res.json({ msg: "Event created successfully!", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Events (only user's events)
router.get("/my-events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Events where user is registered
router.get("/my-registrations", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user })
      .populate("createdBy", "name email");
    res.json(Array.isArray(events) ? events : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ALL events for user dashboard
router.get("/", authMiddleware, async (req, res) => {
  try {
    const q = {};
    if (req.query.category) q.category = req.query.category;
    const events = await Event.find(q)
      .populate("registeredUsers", "name email"); // <-- populate registered users
    res.json(Array.isArray(events) ? events : []); // always send an array
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events created by any admin
router.get("/admin-events", authMiddleware, async (req, res) => {
  try {
    const q = {};
    if (req.query.category) q.category = req.query.category;
    const events = await Event.find(q)
      .populate("createdBy", "name email role")       // creator info
      .populate("registeredUsers", "name email");     // registered users
    res.json(Array.isArray(events) ? events : []);    // always an array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single event by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register logged-in user for an event
router.post("/register/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is already registered
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    const isAlreadyRegistered = event.registeredUsers.some(userId => String(userId) === String(req.user));
    if (isAlreadyRegistered) {
      return res.status(400).json({ error: "You are already registered for this event" });
    }
    
    // Add user to registeredUsers
    const updated = await Event.findOneAndUpdate(
      { _id: id },
      { $addToSet: { registeredUsers: req.user } },
      { new: true }
    );
    
    res.json({ msg: "Registered successfully!", event: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Update Event
router.put("/:id", authMiddleware, async (req, res) => {
  try {
  const { id } = req.params;
  const { title, description, startAt, endAt, timezone, location, status, guests, category } = req.body;

    // Find event by ID and check ownership
    let event = await Event.findOne({ _id: id, createdBy: req.user });
    if (!event) {
      return res.status(404).json({ error: "Event not found or not authorized" });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (typeof startAt !== "undefined") event.startAt = startAt;
    if (typeof endAt !== "undefined") {
      if (endAt && event.startAt && new Date(endAt) < new Date(event.startAt)) {
        return res.status(400).json({ error: "endAt cannot be before startAt" });
      }
      event.endAt = endAt;
    }
    if (timezone) event.timezone = timezone;
    if (location) event.location = location;
    if (status) event.status = status;
    if (guests) event.guests = guests;
    if (typeof category !== "undefined") event.category = category;

    await event.save();
    res.json({ msg: "Event updated successfully!", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE an event (auth + ownership)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, createdBy: req.user });
    if (!event) {
      return res.status(404).json({ msg: "Event not found or not authorized" });
    }
    await event.deleteOne();
    res.json({ msg: "Event deleted successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


module.exports = router;
