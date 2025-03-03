const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course");
const router = express.Router();

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key"; // Replace with a secure key in production

// Middleware to verify JWT and extract user
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Use your JWT_SECRET
    // Fetch the full user data to get the name (assuming name or username exists)
    const user = await User.findById(decoded.id).select("name username role"); // Adjust fields as needed
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: user.username || "Unknown User", // Use name or username, fallback to "Unknown User"
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin-only middleware
const adminMiddleware = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Get all users (admin-only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user details and registered courses (admin-only)
router.get("/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const registeredCourses = await Course.find({ RegisteredUsers: userId });
    res.json({ user, registeredCourses });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register a user
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Proceed with registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    // Auto-login after registration
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.username },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1h" }
    );
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login (ensure token includes name)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select(
      "password role username"
    ); // Include name
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({
      message: "Logged in",
      token,
      role: user.role,
      name: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Role-based dashboard routes
router.get("/admin/dashboard", adminMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  res.json({ message: "Welcome, Admin!" });
});

router.get("/instructor/dashboard", adminMiddleware, (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  res.json({ message: "Welcome, Instructor!" });
});

router.get("/student/dashboard", adminMiddleware, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  res.json({ message: "Welcome, Student!" });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware; // Ensure this line exists
