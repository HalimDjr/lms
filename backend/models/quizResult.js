const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
      selectedOption: {
        type: Number, // Index de l'option sélectionnée
      },
      isCorrect: {
        type: Boolean,
      },
    },
  ],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  timeTaken: {
    type: Number, // en secondes
    required: true,
  },
});

module.exports = mongoose.model("QuizResult", quizResultSchema);
