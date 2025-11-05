const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
  points: {
    type: Number,
    required: true,
    default: 1,
  },
});

module.exports = mongoose.model("Question", questionSchema);
