const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");
const SubSection = require("../models/subSection"); // Ajoutez cette ligne

// Import required controllers

// course controllers
const {
  createCourse,
  getCourseDetails,
  getAllCourses,
  getFullCourseDetails,
  editCourse,
  deleteCourse,
  getInstructorCourses,
} = require("../controllers/course");

const { updateCourseProgress } = require("../controllers/courseProgress");
const {
  enrollFreeCourse,
  requestUnenrollment,
  getStudentUnenrollmentRequests,
  enrollStudentToCourse, // Ajoutez cette ligne
  enrollMultipleStudentsToCourse,
} = require("../controllers/inscription");

// categories Controllers
const {
  createCategory,
  showAllCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getCategoryPageDetails,
} = require("../controllers/category");

// sections controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

// subSections controllers
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
  addResourceToSubSection,
  deleteResourceFromSubSection,
  getSubSectionResources,
} = require("../controllers/subSection");

const {
  getSubSectionQuiz,
  createSubSectionQuiz,
  submitSubSectionQuiz,
  getSubSectionQuizResult,
} = require("../controllers/subSectionQuiz");

// rating controllers
const {
  createRating,
  getAverageRating,
  getAllRatingReview,
} = require("../controllers/ratingAndReview");

// Middlewares
const {
  auth,
  isAdmin,
  isInstructor,
  isStudent,
  isInstructorOrAdmin,
} = require("../middleware/auth");

// Import des contrôleurs de quiz
const {
  createQuiz,
  addQuestion,
  getQuizDetails,
  getQuizForStudent,
  submitQuiz,
  getQuizResult,
  getQuizResults,
  deleteQuiz,
  updateQuiz,
  updateQuestion,
  deleteQuestion,
  getInstructorQuizzes,
  getStudentQuizResults,
} = require("../controllers/quiz");

const {
  uploadCertificate,
  getStudentCertificates,
  getCertificate,
  downloadCertificate,
  getEligibleStudents,
  getCourseCertificates,
} = require("../controllers/certificate");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Courses can Only be Created by Instructors

router.post("/createCourse", auth, isInstructorOrAdmin, createCourse);

//Add a Section to a Course
router.post("/addSection", auth, isInstructorOrAdmin, createSection);
// Update a Section
router.post("/updateSection", auth, isInstructorOrAdmin, updateSection);
// Delete a Section
router.post("/deleteSection", auth, isInstructorOrAdmin, deleteSection);

// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructorOrAdmin, createSubSection);
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructorOrAdmin, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructorOrAdmin, deleteSubSection);

router.post(
  "/addResourceToSubSection",
  auth,
  isInstructorOrAdmin,
  addResourceToSubSection
);
router.delete(
  "/deleteResourceFromSubSection",
  auth,
  isInstructorOrAdmin,
  deleteResourceFromSubSection
);
router.get(
  "/getSubSectionResources/:subSectionId",
  auth,
  getSubSectionResources
);

// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get all Courses
router.get("/getAllCourses", getAllCourses);
// get full course details
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// Get all Courses Under a Specific Instructor
router.get(
  "/getInstructorCourses",
  auth,
  isInstructorOrAdmin,
  getInstructorCourses
);

// Edit Course routes
router.post("/editCourse", auth, isInstructorOrAdmin, editCourse);

// Delete a Course
router.delete("/deleteCourse", auth, isInstructorOrAdmin, deleteCourse);

router.post("/enroll", auth, enrollFreeCourse); // Route pour l'inscription gratuite
// Route pour demander une désinscription
router.post("/request-unenrollment", auth, isStudent, requestUnenrollment);

// Route pour récupérer les demandes de désinscription d'un étudiant
router.get(
  "/unenrollment-requests",
  auth,
  isStudent,
  getStudentUnenrollmentRequests
);
// update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails);
router.get("/categories/:categoryId", getCategoryById);
router.put("/categories/:categoryId", auth, isAdmin, updateCategory);
router.delete("/categories/:categoryId", auth, isAdmin, deleteCategory);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview);

// 2. Ajoutez cette nouvelle route dans votre fichier de routes backend (course.js)

router.get("/resources/:resourceId", auth, async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Trouver la ressource dans la base de données
    const subSection = await SubSection.findOne({
      "resources._id": resourceId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Ressource non trouvée",
      });
    }

    // Trouver la ressource spécifique
    const resource = subSection.resources.find(
      (r) => r._id.toString() === resourceId
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Ressource non trouvée",
      });
    }

    // Vérifier si l'URL est une URL locale
    if (resource.fileUrl.startsWith("/uploads/")) {
      // Construire le chemin absolu vers le fichier
      const filePath = path.join(__dirname, "../public", resource.fileUrl);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé sur le serveur",
        });
      }

      // Définir les en-têtes pour le PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${resource.title}.pdf"`
      );

      // Envoyer le fichier
      return res.sendFile(filePath);
    } else {
      // Si c'est toujours une URL Cloudinary, utiliser fetch comme avant
      const response = await fetch(resource.fileUrl);
      const buffer = await response.buffer();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${resource.title}.pdf"`
      );

      return res.send(buffer);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du PDF:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du PDF",
    });
  }
});

// Route pour télécharger les PDFs
router.get("/download-resource/:resourceId", auth, async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Trouver la ressource dans la base de données
    const subSection = await SubSection.findOne({
      "resources._id": resourceId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Ressource non trouvée",
      });
    }

    // Trouver la ressource spécifique
    const resource = subSection.resources.find(
      (r) => r._id.toString() === resourceId
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Ressource non trouvée",
      });
    }

    // Vérifier si l'URL est une URL locale
    if (resource.fileUrl.startsWith("/uploads/")) {
      // Construire le chemin absolu vers le fichier
      const filePath = path.join(__dirname, "../public", resource.fileUrl);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé sur le serveur",
        });
      }

      // Définir les en-têtes pour le téléchargement
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${resource.title}.pdf"`
      );

      // Envoyer le fichier
      return res.sendFile(filePath);
    } else {
      // Si c'est toujours une URL Cloudinary, utiliser fetch comme avant
      const response = await fetch(resource.fileUrl);
      const buffer = await response.buffer();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${resource.title}.pdf"`
      );

      return res.send(buffer);
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement du PDF",
    });
  }
});

// ********************************************************************************************************
//                                      Quiz routes
// ********************************************************************************************************

// Routes pour les instructeurs
router.post("/quiz/create", auth, isInstructorOrAdmin, createQuiz);
router.post("/quiz/question/add", auth, isInstructorOrAdmin, addQuestion);
router.get("/quiz/:quizId/details", auth, isInstructorOrAdmin, getQuizDetails);
router.get("/quiz/:quizId/results", auth, isInstructorOrAdmin, getQuizResults);
router.put("/quiz/:quizId", auth, isInstructorOrAdmin, updateQuiz);
router.delete("/quiz/:quizId", auth, isInstructorOrAdmin, deleteQuiz);
router.put(
  "/quiz/question/:questionId",
  auth,
  isInstructorOrAdmin,
  updateQuestion
);
router.delete(
  "/quiz/question/:questionId",
  auth,
  isInstructorOrAdmin,
  deleteQuestion
);
// Ajoutez cette route à votre fichier de routes existant
router.get(
  "/quiz/instructor-quizzes",
  auth,
  isInstructorOrAdmin,
  getInstructorQuizzes
);

// Routes pour les étudiants
router.get("/quiz/:quizId/student", auth, isStudent, getQuizForStudent);
router.post("/quiz/submit", auth, isStudent, submitQuiz);
router.get("/quiz/:quizId/result", auth, isStudent, getQuizResult);
router.get("/quiz/student-results", auth, isStudent, getStudentQuizResults);

// Dans course.js (routes)
// Routes pour les quiz de sous-section
router.post(
  "/subsection-quiz/:subSectionId",
  auth,
  isInstructorOrAdmin,
  createSubSectionQuiz
);

router.get("/subsection-quiz/:subSectionId", auth, getSubSectionQuiz);

router.post(
  "/subsection-quiz/:subSectionId/submit",
  auth,
  isStudent,
  submitSubSectionQuiz
);

router.get(
  "/subsection-quiz/:subSectionId/result",
  auth,
  getSubSectionQuizResult
);

// Routes pour les certificats
router.post(
  "/certificate/upload",
  auth,
  isInstructorOrAdmin,
  uploadCertificate
);
router.get("/certificate/student", auth, isStudent, getStudentCertificates);
router.get("/certificate/:certificateId", auth, getCertificate);
router.get("/certificate/:certificateId/download", auth, downloadCertificate);
router.get(
  "/certificate/course/:courseId/eligible",
  auth,
  isInstructorOrAdmin,
  getEligibleStudents
);
router.get(
  "/certificate/course/:courseId",
  auth,
  isInstructorOrAdmin,
  getCourseCertificates
);

// Routes pour l'inscription par l'admin
// Dans routes/course.js

// Route pour l'auto-inscription des étudiants
router.post("/enroll", auth, enrollFreeCourse);

// Routes pour l'inscription par l'admin
router.post("/admin/enroll", auth, isAdmin, enrollStudentToCourse);
router.post("/enroll/multiple", auth, isAdmin, enrollMultipleStudentsToCourse);

module.exports = router;
