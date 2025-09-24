// routes/complaint.js
const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const {
  submitComplaint,
  getUserComplaints,
  getAllComplaints,
  processComplaint,
} = require("../controllers/complaintController");

// Routes pour les réclamations
router.post("/submit", auth, submitComplaint);
router.get("/user", auth, getUserComplaints);
router.get("/all", auth, isAdmin, getAllComplaints);
router.post("/process", auth, isAdmin, processComplaint);

module.exports = router;
