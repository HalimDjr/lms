// models/certificate.js
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  certificateUrl: {
    type: String,
    required: true,
  },
  quizResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizResult",
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Certificate", certificateSchema);
