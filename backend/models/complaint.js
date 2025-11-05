const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["technique", "contenu", "utilisateur", "autre"],
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved", "rejected"],
    default: "pending",
  },
  adminResponse: {
    type: String,
    trim: true,
  },
  attachments: [
    {
      url: String,
      name: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Complaint", complaintSchema);
