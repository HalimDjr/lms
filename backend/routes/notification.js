
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
router.put("/:notificationId/mark-read", auth, markOneAsRead); 

module.exports = router;
