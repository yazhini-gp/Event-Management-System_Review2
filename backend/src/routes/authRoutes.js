const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to check admin
const adminMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Only admins can create users" });
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Admin creates user
router.post("/create-user", adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: role || "user" });
    await user.save();

    res.json({ msg: "User created successfully!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Signup
// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use role from frontend, default to "user" if not provided
    const userRole = role || "user";
    const user = new User({ name, email, password: hashedPassword, role: userRole });
    await user.save();

    // create token including role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ msg: "User registered successfully!", token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // include role in token payload
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ msg: "Login successful!", token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get("/all-users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "name email role"); // only return necessary fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
