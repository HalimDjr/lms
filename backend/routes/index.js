// routes/index.js - Centralisation des routes
const express = require("express");
const router = express.Router();

// Import des routes
const userRoutes = require("./user");
const profileRoutes = require("./profile");
const courseRoutes = require("./course");
const forumRoutes = require("./forum");
const adminRoutes = require("./admin");
const instructorApplicationRoutes = require("./condidateur");
const notificationRoutes = require("./notification");
const reclamationRoute = require("./complaint");
const chatbotRoutes = require("./chatbotRoutes");
// Montage des routes
router.use("/auth", userRoutes);
router.use("/profile", profileRoutes);
router.use("/course", courseRoutes);
router.use("/forum", forumRoutes);
router.use("/admin", adminRoutes);
router.use("/complaint", reclamationRoute);
router.use("/instructor-applications", instructorApplicationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/chatbot", chatbotRoutes);
module.exports = router;
