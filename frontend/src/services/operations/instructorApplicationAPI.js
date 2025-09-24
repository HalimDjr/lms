// frontend/src/services/operations/instructorApplicationAPI.js
import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { instructorApplicationEndpoints } from "../apis";
const {
  SUBMIT_APPLICATION_API,
  GET_ALL_APPLICATIONS_API,
  GET_APPLICATION_BY_ID_API,
  UPDATE_APPLICATION_STATUS_API,
  DELETE_APPLICATION_API,
} = instructorApplicationEndpoints;
// Soumettre une candidature de formateur
export const submitInstructorApplication = async (formData) => {
  const toastId = toast.loading("Soumission en cours...");
  try {
    // Vérifier que le CV est présent dans formData
    const hasCV = formData.has("cv");
    console.log("CV présent dans formData:", hasCV);

    // Ne pas inclure transformRequest dans les headers
    const response = await apiConnector(
      "POST",
      SUBMIT_APPLICATION_API,
      formData,
      {
        "Content-Type": "multipart/form-data",
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Erreur lors de la soumission"
      );
    }

    toast.success("Candidature soumise avec succès");
    return response.data;
  } catch (error) {
    console.log("ERREUR API SUBMIT_INSTRUCTOR_APPLICATION:", error);
    console.log("Détails de l'erreur:", error.response?.data);
    toast.error(error.message || "Une erreur est survenue");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Récupérer toutes les candidatures (admin)
export const getAllInstructorApplications = async (token, status = "") => {
  const toastId = toast.loading("Chargement...");
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_APPLICATIONS_API}${status ? `?status=${status}` : ""}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Erreur lors de la récupération"
      );
    }

    toast.dismiss(toastId);
    return response.data.data;
  } catch (error) {
    console.log("ERREUR API GET_ALL_INSTRUCTOR_APPLICATIONS:", error);
    toast.error(error.message || "Une erreur est survenue");
    toast.dismiss(toastId);
    return [];
  }
};

// Récupérer une candidature par ID (admin)
export const getInstructorApplicationById = async (applicationId, token) => {
  const toastId = toast.loading("Chargement...");
  try {
    const response = await apiConnector(
      "GET",
      `${GET_APPLICATION_BY_ID_API}/${applicationId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Erreur lors de la récupération"
      );
    }

    toast.dismiss(toastId);
    return response.data.data;
  } catch (error) {
    console.log("ERREUR API GET_INSTRUCTOR_APPLICATION_BY_ID:", error);
    toast.error(error.message || "Une erreur est survenue");
    toast.dismiss(toastId);
    return null;
  }
};

// Mettre à jour le statut d'une candidature (admin)
export const updateInstructorApplicationStatus = async (
  applicationId,
  status,
  token
) => {
  const toastId = toast.loading("Mise à jour en cours...");
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_APPLICATION_STATUS_API}/${applicationId}/status`,
      { status },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Erreur lors de la mise à jour"
      );
    }

    toast.success(
      `Candidature ${
        status === "Accepté"
          ? "acceptée"
          : status === "Refusé"
          ? "refusée"
          : "mise à jour"
      } avec succès`
    );
    return response.data.data;
  } catch (error) {
    console.log("ERREUR API UPDATE_INSTRUCTOR_APPLICATION_STATUS:", error);
    toast.error(error.message || "Une erreur est survenue");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Supprimer une candidature (admin)
export const deleteInstructorApplication = async (applicationId, token) => {
  const toastId = toast.loading("Suppression en cours...");
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_APPLICATION_API}/${applicationId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Erreur lors de la suppression"
      );
    }

    toast.success("Candidature supprimée avec succès");
    return true;
  } catch (error) {
    console.log("ERREUR API DELETE_INSTRUCTOR_APPLICATION:", error);
    toast.error(error.message || "Une erreur est survenue");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};
