import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints } from "../apis";

const { GET_ALL_UNENROLLMENT_REQUESTS_API, PROCESS_UNENROLLMENT_REQUEST_API } =
  adminEndpoints;
// Fonction pour récupérer tous les utilisateurs d'un type spécifique avec pagination, recherche et tri
export const getUsersByType = async (
  token,
  accountType,
  page = 1,
  limit = 10,
  search = "",
  sortField = "firstName",
  sortDirection = "asc"
) => {
  const toastId = toast.loading("Chargement...");
  let result = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  };

  try {
    const response = await apiConnector(
      "GET",
      `/api/v1/admin/users?accountType=${accountType}&page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortDirection=${sortDirection}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible de récupérer les utilisateurs");
    }

    result = {
      data: response.data.data,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
    };
  } catch (error) {
    console.log("ERREUR API GET_USERS_BY_TYPE:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour créer un utilisateur
export const createUser = async (data, token) => {
  const toastId = toast.loading("Création en cours...");
  let result = null;
  try {
    const response = await apiConnector("POST", "/api/v1/admin/users", data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Impossible de créer l'utilisateur");
    }

    result = response.data.data;
    toast.success(`${data.accountType} créé avec succès`);
  } catch (error) {
    console.log("ERREUR API CREATE_USER:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour récupérer un utilisateur par son ID
export const getUserById = async (userId, token) => {
  const toastId = toast.loading("Chargement...");
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `/api/v1/admin/users/${userId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible de récupérer les détails de l'utilisateur");
    }

    result = response.data.data;
  } catch (error) {
    console.log("ERREUR API GET_USER_BY_ID:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour mettre à jour un utilisateur
export const updateUser = async (userId, data, token) => {
  const toastId = toast.loading("Mise à jour en cours...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `/api/v1/admin/users/${userId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible de mettre à jour l'utilisateur");
    }

    result = response.data.data;
    toast.success("Utilisateur mis à jour avec succès");
  } catch (error) {
    console.log("ERREUR API UPDATE_USER:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour réinitialiser le mot de passe d'un utilisateur
export const resetUserPassword = async (userId, newPassword, token) => {
  const toastId = toast.loading("Réinitialisation en cours...");
  let result = false;
  try {
    const response = await apiConnector(
      "PUT",
      `/api/v1/admin/users/${userId}/reset-password`,
      { newPassword },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible de réinitialiser le mot de passe");
    }

    result = true;
    toast.success("Mot de passe réinitialisé avec succès");
  } catch (error) {
    console.log("ERREUR API RESET_USER_PASSWORD:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour supprimer un utilisateur
export const deleteUser = async (userId, token) => {
  const toastId = toast.loading("Suppression en cours...");
  let result = false;
  try {
    const response = await apiConnector(
      "DELETE",
      `/api/v1/admin/users/${userId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible de supprimer l'utilisateur");
    }

    result = true;
    toast.success("Utilisateur supprimé avec succès");
  } catch (error) {
    console.log("ERREUR API DELETE_USER:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// Fonction pour approuver un instructeur
export const approveInstructor = async (instructorId, token) => {
  const toastId = toast.loading("Approbation en cours...");
  let result = false;
  try {
    const response = await apiConnector(
      "PUT",
      `/api/v1/admin/instructors/${instructorId}/approve`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Impossible d'approuver l'instructeur");
    }

    result = true;
    toast.success("Instructeur approuvé avec succès");
  } catch (error) {
    console.log("ERREUR API APPROVE_INSTRUCTOR:", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// ================ Récupérer toutes les demandes de désinscription ================
export async function getAllUnenrollmentRequests(token) {
  const toastId = toast.loading("Chargement des demandes...");

  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_UNENROLLMENT_REQUESTS_API,
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
    console.log("GET ALL UNENROLLMENT REQUESTS API ERROR.....", error);
    toast.error(
      "Erreur lors de la récupération des demandes de désinscription"
    );
    return [];
  } finally {
    toast.dismiss(toastId);
  }
}

// ================ Traiter une demande de désinscription ================
export async function processUnenrollmentRequest(
  requestId,
  status,
  adminComment,
  token
) {
  const toastId = toast.loading("Traitement de la demande...");

  try {
    const response = await apiConnector(
      "POST",
      PROCESS_UNENROLLMENT_REQUEST_API,
      {
        requestId,
        status,
        adminComment,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(
      status === "approved"
        ? "Demande approuvée avec succès"
        : "Demande rejetée avec succès"
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.log("PROCESS UNENROLLMENT REQUEST API ERROR.....", error);
    toast.error("Erreur lors du traitement de la demande");
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Erreur lors du traitement de la demande",
    };
  } finally {
    toast.dismiss(toastId);
  }
}

// Vous pouvez ajouter d'autres fonctions d'API admin ici
// Par exemple:

// ================ Obtenir les statistiques des cours ================
export async function getCourseStats(token) {
  try {
    const response = await apiConnector(
      "GET",
      adminEndpoints.GET_COURSE_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.log("GET COURSE STATS API ERROR.....", error);
    toast.error("Erreur lors de la récupération des statistiques des cours");
    return null;
  }
}

// ================ Obtenir les statistiques des utilisateurs ================
export async function getUserStats(token) {
  try {
    const response = await apiConnector(
      "GET",
      adminEndpoints.GET_USER_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.log("GET USER STATS API ERROR.....", error);
    toast.error(
      "Erreur lors de la récupération des statistiques des utilisateurs"
    );
    return null;
  }
}

// Dans adminAPI.js - Fonction modifiée pour exporter des utilisateurs spécifiques
export const exportUsersToPDF = async (token, accountType = null) => {
  try {
    // Construire l'URL avec le paramètre accountType si fourni
    let url = `${adminEndpoints.EXPORT_USERS_PDF_API}`;
    if (accountType) {
      url += `?accountType=${accountType}`;
    }

    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      null,
      "blob" // Spécifier le responseType comme 'blob'
    );

    // Créer un blob à partir de la réponse
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Créer une URL pour le blob
    const fileURL = window.URL.createObjectURL(blob);

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement("a");
    link.href = fileURL;

    // Nommer le fichier en fonction du type de compte
    const fileName = accountType
      ? `${accountType.toLowerCase()}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      : `users-${new Date().toISOString().split("T")[0]}.pdf`;

    link.setAttribute("download", fileName);

    // Ajouter le lien au document, cliquer dessus, puis le supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libérer l'URL
    window.URL.revokeObjectURL(fileURL);

    return true;
  } catch (error) {
    console.error("Erreur lors de l'exportation en PDF:", error);
    toast.error("Erreur lors de l'exportation en PDF");
    return false;
  }
};
