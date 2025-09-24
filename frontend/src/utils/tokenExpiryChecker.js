import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token); // Utilisez jwtDecode au lieu de jwt_decode
    const currentTime = Date.now() / 1000;

    // Si le temps actuel est supérieur au temps d'expiration du token
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return true;
  }
};
