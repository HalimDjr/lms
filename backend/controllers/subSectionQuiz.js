// controllers/subSectionQuiz.js
const mongoose = require("mongoose");
const SubSection = require("../models/subSection");
const SubSectionQuizResult = require("../models/SubSectionQuizResult");
exports.createSubSectionQuiz = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const { questions } = req.body;

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Sous-section non trouvée",
      });
    }

    subSection.quiz = {
      questions,
      isEnabled: true,
    };

    await subSection.save();

    res.status(200).json({
      success: true,
      message: "Quiz créé avec succès",
      data: subSection,
    });
  } catch (error) {
    console.error("CREATE_SUBSECTION_QUIZ_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du quiz",
      error: error.message,
    });
  }
};

// Dans le contrôleur backend (controllers/subSectionQuiz.js)
exports.getSubSectionQuiz = async (req, res) => {
  try {
    const { subSectionId } = req.params;

    // Vérification de l'ID
    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "ID de sous-section manquant",
      });
    }

    // Vérification que l'ID est un ID MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      return res.status(400).json({
        success: false,
        message: "ID de sous-section invalide",
      });
    }

    const subSection = await SubSection.findById(subSectionId);

    // Vérification que la sous-section existe
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Sous-section non trouvée",
      });
    }

    // Vérification que le quiz existe
    if (!subSection.quiz || !subSection.quiz.isEnabled) {
      return res.status(404).json({
        success: false,
        message: "Aucun quiz disponible pour cette sous-section",
      });
    }

    // Retourner le quiz sans les réponses correctes
    const quizForStudent = {
      questions: subSection.quiz.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((o) => ({
          _id: o._id,
          text: o.text,
        })),
      })),
    };

    res.json({
      success: true,
      data: quizForStudent,
    });
  } catch (error) {
    console.error("GET_SUBSECTION_QUIZ_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du quiz",
    });
  }
};
exports.submitSubSectionQuiz = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Récupérer la sous-section pour connaître le nombre actuel de questions
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection || !subSection.quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    const currentQuestionCount = subSection.quiz.questions.length;

    // Vérifier si l'étudiant a déjà complété ce quiz
    const existingResult = await SubSectionQuizResult.findOne({
      user: userId,
      subSection: subSectionId,
    });

    // Calculer le score
    let score = 0;
    const results = answers
      .map((answer) => {
        const question = subSection.quiz.questions.find(
          (q) => q._id.toString() === answer.questionId
        );

        if (!question) return null;

        const selectedOption = question.options.find(
          (opt) => opt._id.toString() === answer.selectedOptionId
        );

        const isCorrect = selectedOption?.isCorrect || false;
        if (isCorrect) score++;

        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
        };
      })
      .filter((result) => result !== null);

    let quizResult;

    // Si un résultat existe déjà, le mettre à jour
    if (existingResult) {
      // Mettre à jour le résultat existant
      existingResult.score = score;
      existingResult.total = currentQuestionCount;
      existingResult.answers = results;
      existingResult.completed = true;
      existingResult.completedAt = Date.now();
      existingResult.questionCount = currentQuestionCount;

      quizResult = await existingResult.save();
    } else {
      // Créer un nouveau résultat
      quizResult = await SubSectionQuizResult.create({
        user: userId,
        subSection: subSectionId,
        score,
        total: currentQuestionCount,
        answers: results,
        completed: true,
        completedAt: Date.now(),
        questionCount: currentQuestionCount,
      });
    }

    res.json({
      success: true,
      data: {
        score: quizResult.score,
        total: currentQuestionCount,
        results: quizResult.answers,
        questions: subSection.quiz.questions,
        completed: true,
      },
      message: "Quiz complété avec succès",
    });
  } catch (error) {
    console.error("SUBMIT_SUBSECTION_QUIZ_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission du quiz",
    });
  }
};

exports.getSubSectionQuizResult = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const userId = req.user.id;

    console.log(
      `Recherche de résultat pour l'utilisateur ${userId} et la sous-section ${subSectionId}`
    );

    // Récupérer la sous-section pour connaître le nombre actuel de questions
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection || !subSection.quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz non trouvé",
      });
    }

    const currentQuestionCount = subSection.quiz.questions.length;

    // Récupérer le résultat le plus récent
    const result = await SubSectionQuizResult.findOne({
      user: userId,
      subSection: subSectionId,
    }).sort({ quizVersion: -1 });

    if (!result) {
      console.log("Aucun résultat trouvé");
      return res.json({
        success: true,
        completed: false,
        data: null,
      });
    }

    console.log("Résultat trouvé:", result);

    // Vérifier si le nombre de questions a changé depuis la dernière tentative
    if (result.questionCount !== currentQuestionCount) {
      return res.json({
        success: true,
        completed: false, // Considérer comme non complété si le nombre de questions a changé
        quizUpdated: true,
        data: null,
      });
    }

    res.json({
      success: true,
      completed: true,
      data: {
        score: result.score,
        total: result.total,
        results: result.answers,
        questions: subSection.quiz.questions,
        completedAt: result.completedAt,
        quizVersion: result.quizVersion,
      },
    });
  } catch (error) {
    console.error("GET_SUBSECTION_QUIZ_RESULT_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des résultats",
    });
  }
};

exports.checkQuizAvailability = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const userId = req.user.id;

    console.log(
      `Vérification de la disponibilité du quiz pour l'utilisateur ${userId} et la sous-section ${subSectionId}`
    );

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      console.log("Sous-section non trouvée");
      return res.status(404).json({
        success: false,
        message: "Sous-section non trouvée",
      });
    }

    const hasQuiz = subSection.quiz && subSection.quiz.isEnabled;
    const currentQuestionCount = hasQuiz ? subSection.quiz.questions.length : 0;
    console.log(
      `Quiz disponible: ${hasQuiz}, Nombre de questions actuel: ${currentQuestionCount}`
    );

    // Vérifier si l'étudiant a déjà complété le quiz
    const existingResult = await SubSectionQuizResult.findOne({
      user: userId,
      subSection: subSectionId,
    });

    console.log(`Résultat existant: ${existingResult ? "Oui" : "Non"}`);
    if (existingResult) {
      console.log(
        `Nombre de questions dans le résultat: ${existingResult.questionCount}`
      );
    }

    // Vérifier si le nombre de questions a changé
    const quizUpdated =
      existingResult && existingResult.questionCount !== currentQuestionCount;
    console.log(`Quiz mis à jour: ${quizUpdated}`);

    // Si le quiz a été mis à jour, supprimer le résultat précédent
    if (quizUpdated) {
      console.log(
        `Suppression du résultat précédent pour l'utilisateur ${userId} et la sous-section ${subSectionId}`
      );

      // Supprimer le résultat existant
      await SubSectionQuizResult.deleteOne({
        user: userId,
        subSection: subSectionId,
      });

      console.log("Résultat supprimé avec succès");

      // Retourner une réponse indiquant que le quiz a été mis à jour et que le résultat a été supprimé
      return res.json({
        success: true,
        hasQuiz,
        completed: false, // Forcer à false car le résultat a été supprimé
        quizUpdated: true,
        currentQuestionCount,
        previousQuestionCount: existingResult.questionCount,
        resultDeleted: true,
      });
    }

    res.json({
      success: true,
      hasQuiz,
      completed: existingResult?.completed || false,
      quizUpdated: false,
      currentQuestionCount,
      previousQuestionCount: existingResult?.questionCount || 0,
    });
  } catch (error) {
    console.error("CHECK_QUIZ_AVAILABILITY_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du quiz",
    });
  }
};
