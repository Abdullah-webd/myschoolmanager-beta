const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  studentName: String,
  studentEmail: String,
  examScore: Number,
  caScore: Number,
  totalScore: Number,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if you want
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Grade", gradeSchema);
