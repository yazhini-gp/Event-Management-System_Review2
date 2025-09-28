const jwt = require("jsonwebtoken");
const Event = require("../models/Event");

const requireAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    req.role = decoded.role;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ error: "Admins only" });
  next();
};

const requireEventOrganizer = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (String(event.createdBy) !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { requireAuth, requireAdmin, requireEventOrganizer };



