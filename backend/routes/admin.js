const express = require("express");
const router = express.Router();
const multer = require("multer");

const { auth, isAdmin } = require("../middleware/auth");
const {
  getAllUnenrollmentRequests,
  processUnenrollmentRequest,
} = require("../controllers/inscription");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  approveInstructor,
  importUsersFromCSV,
  exportUsersToPDF,
  getInstructorStats,
  getStudentStats,
} = require("../controllers/adminController");
const {
  generateDailyStatistics,
  getStatisticsHistory,
  getQuizStatistics,
  getCourseProgressStatistics,
  getRatingStatistics,
} = require("../controllers/statisticsController");
const upload = multer({ dest: "uploads/" });
// Toutes les routes nécessitent une authentification et des privilèges d'administrateur
router.use(auth, isAdmin);

// Routes pour la gestion des utilisateurs
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/instructor-stats", getInstructorStats);

router.get("/student-stats", getStudentStats);

router.put("/users/:userId", updateUser);
router.put("/users/:userId/reset-password", resetUserPassword);
router.delete("/users/:userId", deleteUser);
router.put("/instructors/:userId/approve", approveInstructor);
router.post("/users/import-csv", upload.single("file"), importUsersFromCSV);
router.get("/users/export-pdf", exportUsersToPDF);
router.get("/users/:userId", getUserById);
// Routes pour les statistiques (accès admin uniquement)
router.post("/statistics/generate", auth, isAdmin, generateDailyStatistics);
router.get("/statistics/history", auth, isAdmin, getStatisticsHistory);
router.get("/statistics/quiz-stats", auth, isAdmin, getQuizStatistics);
router.get(
  "/statistics/course-progress",
  auth,
  isAdmin,
  getCourseProgressStatistics
);
router.get("/statistics/rating-stats", auth, isAdmin, getRatingStatistics);

// Routes pour les demandes de désinscription
router.get("/unenrollment-requests", auth, isAdmin, getAllUnenrollmentRequests);
router.post("/process-unenrollment", auth, isAdmin, processUnenrollmentRequest);
module.exports = router;
