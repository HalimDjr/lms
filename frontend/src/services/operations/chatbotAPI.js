import { apiConnector } from "../apiConnector";
import { chatbotEndpoints } from "../apis";

const { GET_CHATBOT_RESPONSE_API, GET_SIMPLE_RESPONSE_API } = chatbotEndpoints;

// Fonction pour suivre les interactions du chatbot
const trackChatbotInteraction = async (message, response, helpful = null) => {
  try {
    await apiConnector("POST", chatbotEndpoints.TRACK_CHATBOT_INTERACTION, {
      message,
      response,
      helpful,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

export const getChatbotResponse = async (message, conversationHistory = []) => {
  try {
    // Ajouter un délai pour éviter les requêtes trop fréquentes
    if (localStorage.getItem("lastChatbotRequest")) {
      const lastRequest = new Date(localStorage.getItem("lastChatbotRequest"));
      const now = new Date();
      if (now - lastRequest < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    localStorage.setItem("lastChatbotRequest", new Date().toString());

    const userContext = {};
    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      if (userInfo) {
        userContext.userId = userInfo.id;
        userContext.name = userInfo.firstName;
        userContext.courses = userInfo.enrolledCourses;
      }
    } catch (e) {
      console.log("No user context available");
    }

    const response = await apiConnector("POST", GET_CHATBOT_RESPONSE_API, {
      message,
      conversationHistory: conversationHistory.slice(-5), 
    });

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Could Not Get Chatbot Response"
      );
    }

    // Suivre l'interaction
    trackChatbotInteraction(message, response.data.response);

    return response.data.response;
  } catch (error) {
    console.error("GET_CHATBOT_RESPONSE_API ERROR:", error);

    // En cas d'erreur utiliser l'endpoint de secours
    try {
      const fallbackResponse = await apiConnector(
        "POST",
        GET_SIMPLE_RESPONSE_API,
        { message }
      );
      if (fallbackResponse?.data?.success) {
        return fallbackResponse.data.response;
      }
    } catch (fallbackError) {
      console.error("GET_SIMPLE_RESPONSE_API ERROR:", fallbackError);
    }

    // Si tout échoue utiliser une réponse locale
    const localFallbackResponse = getLocalFallbackResponse(message);
    return localFallbackResponse;
  }
};

// Fonction de secours locale en cas d'échec complet
const getLocalFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("bonjour") || lowerMessage.includes("salut")) {
    return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
  } else if (lowerMessage.includes("merci")) {
    return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
  } else if (
    lowerMessage.includes("cours") ||
    lowerMessage.includes("formation")
  ) {
    return "Nous proposons diverses formations. Consultez la section Formations pour plus d'informations.";
  }

  return "Désolé, je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer plus tard.";
};
