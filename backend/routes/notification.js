// backend/routes/notification.js
const express = require("express");
const {
  getNotifications,
  markAsRead,
  markOneAsRead,
} = require("../controllers/notificationController");
const {
  auth,
  isAdmin,
  isInstructor,
  isStudent,
  isInstructorOrAdmin,
} = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getNotifications);
router.post("/mark-as-read", auth, markAsRead);
router.put("/:notificationId/mark-read", auth, markOneAsRead); // Nouvelle route

module.exports = router;
