const mongoose = require("mongoose");

const instructorApplicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Homme", "Femme", "Autre"],
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    cv: {
      type: String, // URL du CV stocké sur Cloudinary
      required: true,
    },
    status: {
      type: String,
      enum: ["En attente", "Accepté", "Refusé"],
      default: "En attente",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InstructorApplication",
  instructorApplicationSchema
);
