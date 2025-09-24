import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const {
  COURSE_ENROLL_API,
  REQUEST_UNENROLLMENT_API,
  GET_UNENROLLMENT_REQUESTS_API,
} = studentEndpoints;
// ================ Enroll Course for Free ================
export async function enrollFreeCourse(
  token,
  coursesId,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Enrolling in course...");

  try {
    // Envoyer la requête d'inscription gratuite
    const response = await apiConnector(
      "POST",
      COURSE_ENROLL_API,
      { coursesId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Successfully enrolled in the course!");
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.log("ENROLLMENT API ERROR.....", error);
    toast.error(
      error.response?.data?.message || "Could not enroll in the course"
    );
  }

  toast.dismiss(toastId);
}

// ================ Demande de désinscription d'un cours ================
export async function requestUnenrollment(data, token) {
  const toastId = toast.loading("Soumission de la demande...");

  try {
    const response = await apiConnector(
      "POST",
      REQUEST_UNENROLLMENT_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      message: "Demande de désinscription soumise avec succès",
    };
  } catch (error) {
    console.log("REQUEST UNENROLLMENT API ERROR.....", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Impossible de soumettre la demande de désinscription",
    };
  } finally {
    toast.dismiss(toastId);
  }
}

// ================ Récupérer les demandes de désinscription d'un étudiant ================
export async function getStudentUnenrollmentRequests(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_UNENROLLMENT_REQUESTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.log("GET UNENROLLMENT REQUESTS API ERROR.....", error);
    toast.error(
      "Erreur lors de la récupération des demandes de désinscription"
    );
    return [];
  }
}

// Inscrire un étudiant à un cours (pour l'admin)
// Dans studentFeaturesAPI.js

// Fonction pour l'inscription par l'admin
export async function enrollStudentToCourse(studentId, coursesId, token) {
  const toastId = toast.loading("Inscription en cours...");
  try {
    const response = await apiConnector(
      "POST",
      `${studentEndpoints.ADMIN_ENROLL_STUDENT_API}`,
      { studentId, coursesId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Étudiant inscrit avec succès");
    return {
      success: true,
      message: "Inscription réussie",
    };
  } catch (error) {
    console.log("ENROLLMENT API ERROR.....", error);
    toast.error(
      error.response?.data?.message || "Erreur lors de l'inscription"
    );
    return {
      success: false,
      message: error.response?.data?.message || "Erreur lors de l'inscription",
    };
  } finally {
    toast.dismiss(toastId);
  }
}

// Inscrire plusieurs étudiants à un cours (pour l'admin)
export async function enrollMultipleStudentsToCourse(
  studentIds,
  courseId,
  token
) {
  const toastId = toast.loading("Inscription des étudiants en cours...");

  try {
    const response = await apiConnector(
      "POST",
      `${studentEndpoints.COURSE_ENROLL_API}/multiple`,
      { studentIds, courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(`${studentIds.length} étudiants inscrits avec succès !`);
    return {
      success: true,
      message: `${studentIds.length} étudiants inscrits avec succès`,
      data: response.data.data,
    };
  } catch (error) {
    console.log("MULTIPLE ENROLLMENT API ERROR.....", error);
    toast.error(
      error.response?.data?.message || "Impossible d'inscrire les étudiants"
    );
    return {
      success: false,
      message:
        error.response?.data?.message || "Impossible d'inscrire les étudiants",
    };
  } finally {
    toast.dismiss(toastId);
  }
}
