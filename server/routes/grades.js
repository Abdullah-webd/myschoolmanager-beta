const express = require("express");
const router = express.Router();
const Grade = require("../models/Grade");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

// POST /grades - Teacher submits a grade
router.post("/", async (req, res) => {
  try {
    const { studentName, studentEmail, examScore, caScore, totalScore } = req.body;
    if (!studentName || !studentEmail) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const grade = new Grade({ studentName, studentEmail, examScore, caScore, totalScore });
    await grade.save();

    res.json({ msg: "Result sent successfully", grade });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET: Fetch results for a student by email
router.get("/:email", async (req, res) => {
  try {
    const grades = await Grade.find({ studentEmail: req.params.email });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
