
import { apiConnector } from "../apiConnector";
import { quizEndpoints, subSectionQuizEndpoints } from "../apis";
import { toast } from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const isInstructorOrAdmin = (user) => {
  return user?.accountType === "Instructor" || user?.accountType === "Admin";
};

// Pour la création d'un quiz
export const createQuiz = async (data, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Création d'examen...");
  try {
    const response = await apiConnector(
      "POST",
      quizEndpoints.CREATE_QUIZ_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("examen créé avec succès");
    return response.data;
  } catch (error) {
    console.log("CREATE_QUIZ_API ERROR............", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de la création d'examen"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Ajouter une question au quiz
export const addQuestion = async (data, token, user) => {
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Ajout de la question...");
  try {
    const response = await apiConnector(
      "POST",
      quizEndpoints.ADD_QUESTION_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Question ajoutée avec succès");
    return response.data;
  } catch (error) {
    console.log("ADD_QUESTION_API ERROR............", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de l'ajout de la question"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Obtenir les détails d'un quiz (pour l'instructeur ou admin)
export const getQuizDetails = async (quizId, token, user) => {
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  try {
    const response = await apiConnector(
      "GET",
      `${quizEndpoints.GET_QUIZ_DETAILS_API}/${quizId}/details`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.log("GET_QUIZ_DETAILS_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des détails d'examen"
    );
    return null;
  }
};
// Obtenir un quiz pour un étudiant (sans les réponses correctes)
export const getQuizForStudent = async (quizId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${quizEndpoints.GET_QUIZ_FOR_STUDENT_API}/${quizId}/student`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log("API Response for quiz", quizId, ":");
    console.log(
      "- alreadyTaken:",
      response.data.alreadyTaken,
      "(type:",
      typeof response.data.alreadyTaken,
      ")"
    );
    console.log("- existingAttempt:", response.data.existingAttempt);
    console.log("- resultId:", response.data.resultId);

    const result = {
      ...response.data,
      alreadyTaken: Boolean(response.data.alreadyTaken),
      existingAttempt: response.data.existingAttempt || null,
    };

    console.log("Processed result:");
    console.log(
      "- alreadyTaken:",
      result.alreadyTaken,
      "(type:",
      typeof result.alreadyTaken,
      ")"
    );
    console.log("- existingAttempt:", result.existingAttempt);

    return result;
  } catch (error) {
    console.log("GET_QUIZ_FOR_STUDENT_API ERROR............", error);
    throw error;
  }
};

// Soumettre les réponses d'un quiz
export const submitQuiz = async (data, token) => {
  const toastId = toast.loading("Soumission du l'examen...");
  try {
    const url = `${BASE_URL}/course/quiz/submit`;

    const response = await apiConnector("POST", url, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Examen soumis avec succès");
    return response.data;
  } catch (error) {
    console.log("SUBMIT_QUIZ_API ERROR:", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de la soumission d'examen"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Obtenir les résultats d'un quiz pour un étudiant
export const getQuizResult = async (quizId, token) => {
  try {
    const url = `${BASE_URL}/course/quiz/${quizId}/result`;

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.log("GET_QUIZ_RESULT_API ERROR:", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des résultats"
    );
    return null;
  }
};

// Obtenir tous les résultats d'un quiz pour un instructeur ou admin
export const getQuizResults = async (quizId, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  try {
    const response = await apiConnector(
      "GET",
      `${quizEndpoints.GET_QUIZ_RESULTS_API}/${quizId}/results`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.log("GET_QUIZ_RESULTS_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des résultats"
    );
    return null;
  }
};

// Mettre à jour un quiz
export const updateQuiz = async (quizId, data, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Mise à jour de l'examen...");
  try {
    // Si publie est une chaîne "on", la convertir en booléen true
    if (data.publie === "on") {
      data.publie = true;
    }

    const response = await apiConnector(
      "PUT",
      `${quizEndpoints.UPDATE_QUIZ_API}/${quizId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Examen mis à jour avec succès");
    return response.data;
  } catch (error) {
    console.log("UPDATE_QUIZ_API ERROR............", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de la mise à jour du quiz"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Supprimer un quiz
export const deleteQuiz = async (quizId, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Suppression de l'examen...");
  try {
    const response = await apiConnector(
      "DELETE",
      `${quizEndpoints.DELETE_QUIZ_API}/${quizId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Examen supprimé avec succès");
    return response.data;
  } catch (error) {
    console.log("DELETE_QUIZ_API ERROR............", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de la suppression du quiz"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Mettre à jour une question
export const updateQuestion = async (questionId, data, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Mise à jour de la question...");
  try {
    const response = await apiConnector(
      "PUT",
      `${quizEndpoints.UPDATE_QUESTION_API}/${questionId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Question mise à jour avec succès");
    return response.data;
  } catch (error) {
    console.log("UPDATE_QUESTION_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la question"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Supprimer une question
export const deleteQuestion = async (questionId, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Suppression de la question...");
  try {
    const response = await apiConnector(
      "DELETE",
      `${quizEndpoints.DELETE_QUESTION_API}/${questionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Question supprimée avec succès");
    return response.data;
  } catch (error) {
    console.log("DELETE_QUESTION_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la question"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Récupérer tous les quiz créés par un instructeur ou admin
export const getInstructorQuizzes = async (token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  try {
    const response = await apiConnector(
      "GET",
      quizEndpoints.GET_INSTRUCTOR_QUIZZES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.log("GET_INSTRUCTOR_QUIZZES_API ERROR............", error);
    return null;
  }
};

// Obtenir tous les résultats d'examens d'un étudiant
export const getStudentQuizResults = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      quizEndpoints.GET_STUDENT_QUIZ_RESULTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.log("GET_STUDENT_QUIZ_RESULTS_API ERROR............", error);
    return null;
  }
};
// Créer une tentative de quiz
export const createQuizAttempt = async (quizId, token) => {
  const toastId = toast.loading("Création de la tentative de quiz...");
  try {
    const response = await apiConnector(
      "POST",
      `${quizEndpoints.CREATE_QUIZ_ATTEMPT_API}/${quizId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Tentative de quiz créée avec succès");
    return response.data;
  } catch (error) {
    console.log("CREATE_QUIZ_ATTEMPT_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la création de la tentative de quiz"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
// Dans quizAPI.js
// frontend/src/services/operations/quizAPI.js
export const getSubSectionQuiz = async (subSectionId, token) => {
  try {
    if (!subSectionId || !token) {
      throw new Error("ID de sous-section ou token manquant");
    }

    const response = await apiConnector(
      "GET",
      `${subSectionQuizEndpoints.GET_SUBSECTION_QUIZ}/${subSectionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("GET_SUBSECTION_QUIZ_ERROR:", error);
    throw error;
  }
};

export const getSubSectionQuizResult = async (subSectionId, token) => {
  try {
    console.log("Appel API getSubSectionQuizResult pour:", subSectionId);
    const response = await apiConnector(
      "GET",
      `${subSectionQuizEndpoints.GET_SUBSECTION_QUIZ_RESULT}/${subSectionId}/result`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("Réponse API getSubSectionQuizResult:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET_SUBSECTION_QUIZ_RESULT_ERROR:", error);
    // Retourner un objet par défaut au lieu de lancer une erreur
    return {
      success: false,
      completed: false,
      data: null,
    };
  }
};

export const submitSubSectionQuiz = async (subSectionId, data, token) => {
  try {
    const response = await apiConnector(
      "POST",
      `${subSectionQuizEndpoints.SUBMIT_SUBSECTION_QUIZ}/${subSectionId}/submit`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response.data.success) {
      toast.success("Quiz soumis avec succès");
    }

    return response.data;
  } catch (error) {
    console.log("SUBMIT_SUBSECTION_QUIZ_ERROR:", error);
    toast.error("Erreur lors de la soumission du quiz");
    throw error;
  }
};

// Créer un quiz pour une sous-section
export const createSubSectionQuiz = async (subSectionId, data, token) => {
  const toastId = toast.loading("Création du quiz...");
  try {
    const response = await apiConnector(
      "POST",
      `${subSectionQuizEndpoints.CREATE_SUBSECTION_QUIZ}/${subSectionId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quiz créé avec succès");
    return response.data;
  } catch (error) {
    console.log("CREATE_SUBSECTION_QUIZ_ERROR:", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de la création du quiz"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const checkQuizAvailability = async (subSectionId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${subSectionQuizEndpoints.CHECK_QUIZ_AVAILABILITY}/${subSectionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.log("CHECK_QUIZ_AVAILABILITY_ERROR:", error);
    return {
      success: false,
      hasQuiz: false,
      quizUpdated: false,
    };
  }
};
