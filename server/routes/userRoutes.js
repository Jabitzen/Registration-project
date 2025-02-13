import express from "express";
import Course from "../models/Course";
import User from "../models/User";

const router = express.Router();

// Admin middleware
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.body.userId; // Assume userId is sent in request
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next(); // Proceed if user is an admin
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Register user for a course
router.post("/courses/:courseId/register", async (req, res) => {
  const { userId } = req.body;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    // Check if user is already registered
    if (course.RegisteredUsers.includes(userId)) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Check if course is full
    if (course.TotalRegistered >= course.Capacity) {
      return res.status(400).json({ message: "Course is full" });
    }

    // Add user to course
    course.RegisteredUsers.push(userId);
    course.TotalRegistered += 1;
    await course.save();

    // Add course to user's list
    user.registeredCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: "User registered successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
