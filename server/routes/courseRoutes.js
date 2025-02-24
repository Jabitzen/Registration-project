const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User"); // Adjust path to your User model
const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key"; // Replace with a secure key in production

// Middleware to verify JWT and extract user
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Use your JWT_SECRET
    req.user = decoded; // { id, role } from token
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register for a course
router.post("/:courseId/register", authMiddleware, async (req, res) => {
  const userId = req.user.id; // From JWT

  try {
    // Find the course
    const findCourse = await Course.find({ _id: req.params.courseId });
    const course = findCourse[0];
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if user is already registered
    if (course.RegisteredUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already registered for this course" });
    }

    // Check capacity (assuming Capacity is a string number, e.g., "30")
    const capacity = parseInt(course.Capacity, 10);
    if (capacity && course.RegisteredUsers.length >= capacity) {
      return res.status(400).json({ message: "Course is full" });
    }

    // Add user to RegisteredUsers and update TotalRegistered
    course.RegisteredUsers.push(userId);
    course.TotalRegistered = course.RegisteredUsers.length.toString();
    await course.save();

    res.status(200).json({ message: "Successfully registered for the course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.find({ CourseID: req.params.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(404).json({ error: "Course not found" });
  }
});

// Create a new course
router.post("/", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.json(newCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a course
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { CourseID: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a course
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
