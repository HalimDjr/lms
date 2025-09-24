const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: { type: String },
  timeDuration: { type: String },
  description: { type: String },
  videoUrl: { type: String },
  resources: [
    {
      title: { type: String },
      fileUrl: { type: String },
      fileType: { type: String, default: "pdf" }, // Peut être "pdf", "ppt" ou "other"
    },
  ],

  quiz: {
    questions: [
      {
        text: { type: String },
        options: [
          {
            text: { type: String },
            isCorrect: { type: Boolean },
          },
        ],
      },
    ],
    isEnabled: { type: Boolean, default: false },
  },
});

module.exports =
  mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);
