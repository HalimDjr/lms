const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
  service: {
    type: String,
    default: null,
  },
  ecole: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
