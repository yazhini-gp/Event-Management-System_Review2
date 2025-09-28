const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const { randomUUID } = require("crypto");
const Certificate = require("../models/Certificate");
const Event = require("../models/Event");
const User = require("../models/User");
const OrganizerSignature = require("../models/OrganizerSignature");

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

// Get all certificates for a user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Authorization: allow if self or admin
    if (req.user !== String(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const certificates = await Certificate.find({ user: userId })
      .populate('event', 'title startAt location')
      .populate('user', 'name email')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all certificates for an event (admin only)
router.get("/event/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    // Authorization: only event organizer
    if (String(event.createdBy) !== req.user) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const certificates = await Certificate.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Generate and stream certificate PDF for a user and event
// Supports query params:
//  - type: participation | winner | achievement
//  - position: e.g., "1st Place" (for type=winner)
//  - achievement: e.g., "Best Performance" (for type=achievement)
router.get("/:eventId/:userId", authMiddleware, async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    // Check if certificate already exists
    let existingCertificate = await Certificate.findOne({ event: eventId, user: userId });
    
    // Use existing certificate data if available, otherwise use query params
    const certificateType = existingCertificate?.certificateType || 
      (["participation", "winner", "achievement"].includes(String(req.query.type))
        ? String(req.query.type)
        : "participation");
    const position = existingCertificate?.position || 
      (typeof req.query.position === "string" ? req.query.position : undefined);
    const achievement = existingCertificate?.achievement || 
      (typeof req.query.achievement === "string" ? req.query.achievement : undefined);
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    if (!event || !user) return res.status(404).json({ error: "Event or User not found" });

    // Authorization: allow if organizer, self, or admin
    const isSelf = req.user === String(userId);
    const isOrganizer = String(event.createdBy) === req.user;
    
    // Check if user is admin (you can add more admin role checks here)
    const currentUser = await User.findById(req.user);
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    if (!isSelf && !isOrganizer && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Fetch organizer signature or fallback
    let signaturePath;
    const orgSig = await OrganizerSignature.findOne({ user: event.createdBy });
    if (orgSig) {
      signaturePath = path.join(__dirname, `../../${orgSig.fileUrl}`);
    } else {
      signaturePath = path.join(__dirname, "../../frontend/public/signature.jpg");
    }

    // Prepare PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate-${user.name.replace(/\s+/g, '-')}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // Enhanced certificate layout
    const titleByType = {
      participation: "Certificate of Participation",
      winner: "Certificate of Winner",
      achievement: "Certificate of Achievement",
    };
    doc.fontSize(32).text(titleByType[certificateType], { align: "center" });
    doc.moveDown(1.5);
    
    // Border decoration
    doc.rect(50, 150, doc.page.width - 100, doc.page.height - 300).stroke();
    
    doc.moveDown(2);
    doc.fontSize(18).text("This is to certify that", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(24).text(user.name, { align: "center" });
    doc.moveDown(1);
    if (certificateType === "participation") {
      doc.fontSize(18).text("has successfully participated in", { align: "center" });
    } else if (certificateType === "winner") {
      doc.fontSize(18).text("has achieved outstanding performance in", { align: "center" });
    } else {
      doc.fontSize(18).text("is hereby recognized for", { align: "center" });
    }
    doc.moveDown(1);
    doc.fontSize(20).text(`"${event.title}"`, { align: "center" });
    
    if (event.startAt) {
      doc.moveDown(1);
      doc.fontSize(16).text(`Date: ${new Date(event.startAt).toLocaleDateString()}`, { align: "center" });
    }
    if (event.location) {
      doc.fontSize(16).text(`Location: ${event.location}`, { align: "center" });
    }

    if (certificateType === "winner" && position) {
      doc.moveDown(0.5);
      doc.fontSize(16).text(`Position: ${position}`, { align: "center" });
    }
    if (certificateType === "achievement" && achievement) {
      doc.moveDown(0.5);
      doc.fontSize(16).text(`Achievement: ${achievement}`, { align: "center" });
    }

    // Signature section
    doc.moveDown(3);
    try {
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, doc.page.width / 2 - 60, doc.y, { width: 120 });
        doc.moveDown(1);
        doc.fontSize(14).text("Organizer Signature", { align: "center" });
      }
    } catch (_) {}

    // Certificate number - use existing or create new
    const certificateNo = existingCertificate?.certificateNo || randomUUID();
    doc.moveDown(2);
    doc.fontSize(10).text(`Certificate No: ${certificateNo}`, { align: "center" });

    // Save certificate record only if it doesn't exist
    if (!existingCertificate) {
      await Certificate.create({
        event: event._id,
        user: user._id,
        certificateNo,
        certificateType,
        position: certificateType === "winner" ? position : undefined,
        achievement: certificateType === "achievement" ? achievement : undefined,
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


