// routes/forum.js
const express = require("express");
const router = express.Router();

const {
  getForumMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  toggleLikeMessage,
  togglePinMessage,
  toggleSolutionStatus,
} = require("../controllers/forum");

const { auth } = require("../middleware/auth");

// Routes existantes
router.get("/messages/:subsectionId", auth, getForumMessages);
router.post("/message", auth, createMessage);
router.put("/message/:messageId", auth, updateMessage);
router.delete("/message/:messageId", auth, deleteMessage);

// Nouvelles routes
router.post("/message/like/:messageId", auth, toggleLikeMessage);
router.post("/message/pin/:messageId", auth, togglePinMessage);
router.post("/message/solution/:messageId", auth, toggleSolutionStatus);

module.exports = router;
