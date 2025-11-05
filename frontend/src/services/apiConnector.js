
import axios from "axios";
import { isTokenExpired } from "../utils/tokenExpiryChecker";
import { store } from "../main"; 
import { setToken } from "../slices/authSlice";
import { setUser } from "../slices/profileSlice";
import { toast } from "react-hot-toast";

export const axiosInstance = axios.create({});

const logoutUser = () => {
  store.dispatch(setToken(null));
  store.dispatch(setUser(null));
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  toast.error("Session expirée. Veuillez vous reconnecter.");

  
  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
};

// Intercepteur de requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      const tokenValue = JSON.parse(token);

      // Vérifier si le token est expiré
      if (isTokenExpired(tokenValue)) {
        console.log("Token expiré, déconnexion...");
        logoutUser();

        // Annuler la requête
        return Promise.reject(
          new Error("Session expirée. Veuillez vous reconnecter.")
        );
      }

      // Si le token est valide, l'ajouter à l'en-tête d'autorisation
      if (config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${tokenValue}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs 401 (non autorisé)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Réponse 401, déconnexion...");
      logoutUser();
    }
    return Promise.reject(error);
  }
);

export const apiConnector = (
  method,
  url,
  bodyData,
  headers,
  params,
  responseType
) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
    responseType: responseType || "json",
  });
};
