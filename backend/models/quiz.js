const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // durée en minutes
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  passingPoints: {
    type: Number,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  // Nouveau champ "publie"
  publie: {
    type: Boolean,
    default: false, // Par défaut, un quiz n'est pas publié
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
