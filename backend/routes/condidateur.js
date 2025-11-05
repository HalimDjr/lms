
const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  downloadCV,
} = require("../controllers/condidateur");

// Route publique pour soumettre une candidature
router.post("/submit", submitApplication);

// Routes protégées pour l'admin
router.get("/", auth, isAdmin, getAllApplications);
router.get("/:applicationId", auth, isAdmin, getApplicationById);
router.put("/:applicationId/status", auth, isAdmin, updateApplicationStatus);
router.delete("/:applicationId", auth, isAdmin, deleteApplication);
router.get("/:applicationId/download-cv", auth, isAdmin, downloadCV);

module.exports = router;
