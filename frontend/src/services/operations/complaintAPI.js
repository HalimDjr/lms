
import { toast } from "react-hot-toast";
import { complaintEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const {
  SUBMIT_COMPLAINT_API,
  GET_USER_COMPLAINTS_API,
  GET_ALL_COMPLAINTS_API,
  PROCESS_COMPLAINT_API,
} = complaintEndpoints;

// Soumettre une réclamation
export async function submitComplaint(data, token) {
  const toastId = toast.loading("Soumission de la réclamation...");

  try {
    const response = await apiConnector("POST", SUBMIT_COMPLAINT_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Réclamation soumise avec succès");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.log("SUBMIT COMPLAINT API ERROR.....", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors de la soumission de la réclamation"
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Erreur lors de la soumission de la réclamation",
    };
  } finally {
    toast.dismiss(toastId);
  }
}

// Récupérer les réclamations de l'utilisateur
export async function getUserComplaints(token) {
  try {
    const response = await apiConnector("GET", GET_USER_COMPLAINTS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.log("GET USER COMPLAINTS API ERROR.....", error);
    toast.error("Erreur lors de la récupération des réclamations");
    return [];
  }
}

// Récupérer toutes les réclamations (admin)
export async function getAllComplaints(token) {
  try {
    const response = await apiConnector("GET", GET_ALL_COMPLAINTS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.log("GET ALL COMPLAINTS API ERROR.....", error);
    toast.error("Erreur lors de la récupération des réclamations");
    return [];
  }
}

// Traiter une réclamation (admin)
export async function processComplaint(
  complaintId,
  status,
  adminResponse,
  token
) {
  const toastId = toast.loading("Traitement de la réclamation...");

  try {
    const response = await apiConnector(
      "POST",
      PROCESS_COMPLAINT_API,
      {
        complaintId,
        status,
        adminResponse,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Réclamation traitée avec succès");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.log("PROCESS COMPLAINT API ERROR.....", error);
    toast.error(
      error.response?.data?.message ||
        "Erreur lors du traitement de la réclamation"
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Erreur lors du traitement de la réclamation",
    };
  } finally {
    toast.dismiss(toastId);
  }
}
