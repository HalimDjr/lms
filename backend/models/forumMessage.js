const mongoose = require("mongoose");

const forumMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumMessage",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ForumMessage",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isSolution: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumMessage", forumMessageSchema);
