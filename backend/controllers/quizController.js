const Quiz = require("../models/quiz");
const Question = require("../models/question");
const QuizResult = require("../models/quizResult");
const Course = require("../models/course");
const { createNotification } = require("./notificationController");
const User = require("../models/user");

// Fonction helper pour vérifier les droits d'accès (instructeur ou admin)
const checkInstructorOrAdminAccess = async (
  courseId,
  userId,
  userAccountType
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Cours non trouvé");
  }

  // Permettre l'accès si c'est l'instructeur du cours OU un admin
  if (course.instructor.toString() !== userId && userAccountType !== "Admin") {
    throw new Error("Non autorisé");
  }

  return course;
};

exports.getQuizForStudent = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate({
        path: "questions",
        select: "text options._id options.text points",
      })
      .populate("course", "courseName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'étudiant est inscrit au cours ou si c'est un admin
    const course = await Course.findById(quiz.course._id);
    if (
      !course.studentsEnrolled.includes(req.user.id) &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas inscrit à cette formation",
      });
    }

    // Vérifier si l'étudiant a déjà passé le quiz avec des critères plus stricts
    const existingCompletedResult = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
      isCompleted: true,
      // Ajouter des vérifications supplémentaires
      endTime: { $ne: null }, // S'assurer qu'il y a une heure de fin
      timeTaken: { $gt: 0 }, // S'assurer qu'il y a un temps pris
      answers: { $exists: true, $not: { $size: 0 } }, // S'assurer qu'il y a des réponses
    });

    console.log("Recherche de tentative complétée:", {
      quizId,
      userId: req.user.id,
      found: !!existingCompletedResult,
      result: existingCompletedResult,
    });

    if (existingCompletedResult) {
      return res.status(200).json({
        success: true,
        alreadyTaken: true,
        resultId: existingCompletedResult._id,
        message: "Vous avez déjà passé ce quiz",
      });
    }

    // Vérifier s'il existe une tentative en cours non complétée
    const existingIncompleteResult = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
      isCompleted: false,
    });

    console.log("Recherche de tentative incomplète:", {
      quizId,
      userId: req.user.id,
      found: !!existingIncompleteResult,
      result: existingIncompleteResult,
    });

    res.status(200).json({
      success: true,
      alreadyTaken: false,
      existingAttempt: existingIncompleteResult
        ? existingIncompleteResult._id
        : null,
      data: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        passingPoints: quiz.passingPoints,
        questions: quiz.questions.map((q) => ({
          _id: q._id,
          text: q.text,
          options: q.options.map((o) => ({
            _id: o._id,
            text: o.text,
          })),
          points: q.points,
        })),
        course: quiz.course,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du quiz pour l'étudiant:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du quiz",
      error: error.message,
    });
  }
};

// Créer une tentative de quiz (nouvelle fonction)
exports.createQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Vérifier si le quiz existe
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'étudiant est inscrit au cours
    const course = await Course.findById(quiz.course);
    if (
      !course.studentsEnrolled.includes(req.user.id) &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas inscrit à ce cours",
      });
    }

    // Vérifier si l'étudiant a déjà une tentative complétée
    const existingCompletedResult = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
      isCompleted: true,
    });

    if (existingCompletedResult) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà passé ce quiz",
        resultId: existingCompletedResult._id,
      });
    }

    // Vérifier s'il existe déjà une tentative non complétée
    let quizAttempt = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
      isCompleted: false,
    });

    // Si aucune tentative n'existe, en créer une nouvelle
    if (!quizAttempt) {
      quizAttempt = await QuizResult.create({
        quiz: quizId,
        user: req.user.id,
        score: 0,
        passed: false,
        answers: [],
        startTime: new Date(),
        endTime: null,
        timeTaken: 0,
        isCompleted: false,
      });
    }

    res.status(201).json({
      success: true,
      attemptId: quizAttempt._id,
      message: "Tentative de quiz créée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la tentative de quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la tentative de quiz",
      error: error.message,
    });
  }
};
