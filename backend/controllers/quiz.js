// controllers/quiz.js
const Quiz = require("../models/quiz");
const Question = require("../models/question");
const QuizResult = require("../models/quizResult");
const Course = require("../models/course");

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

// Créer un nouveau quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      courseId,
      description,
      duration,
      totalPoints,
      passingPoints,
      publie, // Ajout du nouveau champ
    } = req.body;

    try {
      // Utiliser la fonction helper pour vérifier les droits
      await checkInstructorOrAdminAccess(
        courseId,
        req.user.id,
        req.user.accountType
      );
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Créer le quiz avec le champ publie
    const quiz = await Quiz.create({
      title,
      course: courseId,
      description,
      duration,
      totalPoints,
      passingPoints,
      publie: publie || false, // Valeur par défaut si non spécifiée
      createdAt: Date.now(),
    });

    // Mettre à jour le cours avec la référence au quiz
    await Course.findByIdAndUpdate(courseId, { finalQuiz: quiz._id });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du quiz",
      error: error.message,
    });
  }
};

// Ajouter une question au quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quizId, text, options, points } = req.body;

    // Vérifier si le quiz existe
    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce quiz",
      });
    }

    // Vérifier qu'il y a au moins une option correcte
    const hasCorrectOption = options.some((option) => option.isCorrect);
    if (!hasCorrectOption) {
      return res.status(400).json({
        success: false,
        message: "Au moins une option doit être correcte",
      });
    }

    // Créer la question
    const question = await Question.create({
      quiz: quizId,
      text,
      options,
      points,
    });

    // Ajouter la question au quiz
    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: question._id },
      updatedAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: question,
      message: "Question ajoutée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la question:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de la question",
      error: error.message,
    });
  }
};

// Obtenir les détails d'un quiz
exports.getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate("questions")
      .populate("course", "courseName instructor");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à accéder à ce quiz",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des détails du quiz",
      error: error.message,
    });
  }
};

// Obtenir un quiz pour un étudiant (sans les réponses correctes)
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
        message: "Vous n'êtes pas inscrit à ce cours",
      });
    }

    // Vérifier si l'étudiant a déjà passé le quiz
    const existingResult = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
    });

    if (existingResult) {
      return res.status(200).json({
        success: true,
        alreadyTaken: true,
        resultId: existingResult._id,
        message: "Vous avez déjà passé ce quiz",
      });
    }

    res.status(200).json({
      success: true,
      alreadyTaken: false,
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

// Soumettre les réponses d'un quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, startTime } = req.body;
    const endTime = new Date();

    // Vérifier si le quiz existe
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'étudiant est inscrit au cours ou si c'est un admin
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

    // Vérifier si l'étudiant a déjà passé le quiz
    const existingResult = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà passé ce quiz",
        result: existingResult,
      });
    }

    // Calculer le score
    let score = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (!question) continue;

      const isCorrect =
        question.options[answer.selectedOption]?.isCorrect || false;

      if (isCorrect) {
        score += question.points;
      }

      processedAnswers.push({
        question: question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    }

    // Vérifier si l'étudiant a réussi le quiz
    const passed = score >= quiz.passingPoints;

    // Calculer le temps pris
    const startTimeDate = new Date(startTime);
    const timeTaken = Math.floor((endTime - startTimeDate) / 1000); // en secondes

    // Enregistrer le résultat
    const quizResult = await QuizResult.create({
      quiz: quizId,
      user: req.user.id,
      score,
      passed,
      answers: processedAnswers,
      startTime: startTimeDate,
      endTime,
      timeTaken,
    });

    res.status(200).json({
      success: true,
      data: {
        result: quizResult,
        totalPoints: quiz.totalPoints,
        passingPoints: quiz.passingPoints,
      },
      message: passed
        ? "Félicitations! Vous avez réussi le quiz."
        : "Vous n'avez pas obtenu le score minimum requis.",
    });
  } catch (error) {
    console.error("Erreur lors de la soumission du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission du quiz",
      error: error.message,
    });
  }
};

// Obtenir les résultats d'un quiz pour un étudiant
exports.getQuizResult = async (req, res) => {
  try {
    const { quizId } = req.params;

    const result = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
    }).populate({
      path: "answers.question",
      select: "text options points",
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Résultat non trouvé",
      });
    }

    const quiz = await Quiz.findById(quizId).populate(
      "course",
      "_id courseName"
    );

    res.status(200).json({
      success: true,
      data: {
        result,
        totalPoints: quiz.totalPoints,
        passingPoints: quiz.passingPoints,
        courseId: quiz.course._id, // Ajout explicite du courseId
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du résultat du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du résultat",
      error: error.message,
    });
  }
};

// Obtenir tous les résultats d'un quiz pour un instructeur
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à voir ces résultats",
      });
    }

    const results = await QuizResult.find({ quiz: quizId })
      .populate("user", "firstName lastName email")
      .select("user score passed timeTaken startTime endTime");

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des résultats du quiz:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des résultats",
      error: error.message,
    });
  }
};

// Supprimer un quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer ce quiz",
      });
    }

    // Supprimer toutes les questions associées
    await Question.deleteMany({ quiz: quizId });

    // Supprimer tous les résultats associés
    await QuizResult.deleteMany({ quiz: quizId });

    // Supprimer la référence au quiz dans le cours
    await Course.findByIdAndUpdate(quiz.course._id, {
      $unset: { finalQuiz: "" },
    });

    // Supprimer le quiz
    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      success: true,
      message: "Quiz supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du quiz",
      error: error.message,
    });
  }
};

// Mettre à jour un quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, duration, totalPoints, passingPoints, publie } =
      req.body;

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce quiz",
      });
    }

    // Convertir la valeur "publie" en booléen si nécessaire
    let publieBoolean;
    if (publie === "on") {
      publieBoolean = true;
    } else if (publie === "off" || publie === undefined || publie === null) {
      publieBoolean = false;
    } else {
      // Si c'est déjà un booléen, garder tel quel
      publieBoolean = Boolean(publie);
    }

    // Mettre à jour le quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        title,
        description,
        duration,
        totalPoints,
        passingPoints,
        publie: publieBoolean, // Utiliser la valeur convertie
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedQuiz,
      message: "Quiz mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du quiz:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du quiz",
      error: error.message,
    });
  }
};

// Mettre à jour une question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text, options, points } = req.body;

    const question = await Question.findById(questionId).populate({
      path: "quiz",
      populate: "course",
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question non trouvée",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      question.quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cette question",
      });
    }

    // Vérifier qu'il y a au moins une option correcte
    const hasCorrectOption = options.some((option) => option.isCorrect);
    if (!hasCorrectOption) {
      return res.status(400).json({
        success: false,
        message: "Au moins une option doit être correcte",
      });
    }

    // Mettre à jour la question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        text,
        options,
        points,
      },
      { new: true }
    );

    // Mettre à jour la date de mise à jour du quiz
    await Quiz.findByIdAndUpdate(question.quiz._id, {
      updatedAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: "Question mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la question:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la question",
      error: error.message,
    });
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId).populate({
      path: "quiz",
      populate: "course",
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question non trouvée",
      });
    }

    // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
    if (
      question.quiz.course.instructor.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cette question",
      });
    }

    // Supprimer la référence à la question dans le quiz
    await Quiz.findByIdAndUpdate(question.quiz._id, {
      $pull: { questions: questionId },
      updatedAt: Date.now(),
    });

    // Supprimer la question
    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: "Question supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la question:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la question",
      error: error.message,
    });
  }
};

// Récupérer tous les quiz créés par un instructeur
exports.getInstructorQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.accountType === "Admin";

    let quizzes;
    if (isAdmin) {
      // L'admin voit tous les quiz
      quizzes = await Quiz.find()
        .populate("course", "courseName")
        .populate("questions")
        .lean();
    } else {
      // L'instructeur voit ses propres quiz
      const courses = await Course.find({ instructor: userId }).select("_id");
      const courseIds = courses.map((course) => course._id);
      quizzes = await Quiz.find({ course: { $in: courseIds } })
        .populate("course", "courseName")
        .populate("questions")
        .lean();
    }

    // Ajouter le nombre de participants pour chaque quiz
    const quizzesWithParticipants = await Promise.all(
      quizzes.map(async (quiz) => {
        const participantsCount = await QuizResult.countDocuments({
          quiz: quiz._id,
        });
        return {
          ...quiz,
          participantsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: quizzesWithParticipants,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des quiz de l'instructeur:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des quiz",
      error: error.message,
    });
  }
};

// Obtenir tous les résultats d'examens d'un étudiant
exports.getStudentQuizResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Trouver tous les résultats de quiz de l'étudiant
    const results = await QuizResult.find({ user: studentId })
      .populate({
        path: "quiz",
        select: "title totalPoints passingPoints duration course publie",
        populate: {
          path: "course",
          select: "courseName",
        },
      })
      .sort({ endTime: -1 });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des résultats d'examens de l'étudiant:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des résultats d'examens",
      error: error.message,
    });
  }
};
