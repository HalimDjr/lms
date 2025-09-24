// frontend/src/services/operations/certificateAPI.js
import { apiConnector } from "../apiConnector";
import { certificateEndpoints } from "../apis";
import { toast } from "react-hot-toast";

// Helper pour vérifier si l'utilisateur est instructeur ou admin
const isInstructorOrAdmin = (user) => {
  return user?.accountType === "Instructor" || user?.accountType === "Admin";
};

// Obtenir les étudiants éligibles pour un certificat
export const getEligibleStudents = async (courseId, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  try {
    const response = await apiConnector(
      "GET",
      `${certificateEndpoints.GET_ELIGIBLE_STUDENTS_API}/${courseId}/eligible`,
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
    console.log("GET_ELIGIBLE_STUDENTS_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des étudiants éligibles"
    );
    return null;
  }
};

// Téléverser un certificat
export const uploadCertificate = async (data, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  const toastId = toast.loading("Téléversement du certificat...");
  try {
    const response = await apiConnector(
      "POST",
      certificateEndpoints.UPLOAD_CERTIFICATE_API,
      data,
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Certificat téléversé avec succès");
    return response.data;
  } catch (error) {
    console.log("UPLOAD_CERTIFICATE_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors du téléversement du certificat"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Obtenir les certificats d'un cours
// Obtenir les certificats d'un cours (suite)
export const getCourseCertificates = async (courseId, token, user) => {
  // Vérification optionnelle côté client
  if (user && !isInstructorOrAdmin(user)) {
    toast.error("Non autorisé");
    return null;
  }

  try {
    const response = await apiConnector(
      "GET",
      `${certificateEndpoints.GET_COURSE_CERTIFICATES_API}/${courseId}`,
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
    console.log("GET_COURSE_CERTIFICATES_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des certificats"
    );
    return null;
  }
};

// Obtenir les certificats d'un étudiant
export const getStudentCertificates = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      certificateEndpoints.GET_STUDENT_CERTIFICATES_API,
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
    console.log("GET_STUDENT_CERTIFICATES_API ERROR............", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des certificats"
    );
    return null;
  }
};

// Télécharger un certificat
export const downloadCertificate = async (certificateId, token) => {
  try {
    window.open(
      `${process.env.REACT_APP_BASE_URL}${certificateEndpoints.DOWNLOAD_CERTIFICATE_API}/${certificateId}/download?token=${token}`,
      "_blank"
    );
    return true;
  } catch (error) {
    console.log("DOWNLOAD_CERTIFICATE_API ERROR............", error);
    toast.error("Erreur lors du téléchargement du certificat");
    return false;
  }
};
