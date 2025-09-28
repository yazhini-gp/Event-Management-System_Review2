const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const OrganizerSignature = require("../models/OrganizerSignature");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads/signatures");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user}${ext || ".png"}`);
  },
});

const upload = multer({ storage });

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

// Upload or replace organizer signature
router.post("/upload", authMiddleware, upload.single("signature"), async (req, res) => {
  try {
    const fileUrl = `/uploads/signatures/${req.file.filename}`;
    const sig = await OrganizerSignature.findOneAndUpdate(
      { user: req.user },
      { fileUrl },
      { upsert: true, new: true }
    );
    res.json({ msg: "Signature saved", signature: sig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get signature URL or default fallback
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const sig = await OrganizerSignature.findOne({ user: req.user });
    if (sig) return res.json({ fileUrl: sig.fileUrl });
    // fallback: use frontend public asset path known to frontend
    return res.json({ fileUrl: "/public/signature.jpg" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



