// models/SubSectionQuizResult.js
const mongoose = require("mongoose");

const subSectionQuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
    required: true,
  },
  quizVersion: {
    type: Number,
    default: 1,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionId: String,
      selectedOptionId: String,
      isCorrect: Boolean,
    },
  ],
  completed: {
    type: Boolean,
    default: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  questionCount: {
    type: Number,
    required: true,
  },
});

subSectionQuizResultSchema.index(
  { user: 1, subSection: 1, quizVersion: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SubSectionQuizResult",
  subSectionQuizResultSchema
);
