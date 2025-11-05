export const chatbotConfig = {
  welcomeMessage:
    "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
  fallbackMessage:
    "Désolé, je n'ai pas bien compris votre question. Pourriez-vous être plus précis ?",
  typingDelay: 1000,
  maxHistoryLength: 50,
  defaultSuggestions: [
    "Voir les formations",
    "Comment ça marche ?",
    "Contacter le support",
  ],
  features: {
    suggestions: true,
    history: true,
    analytics: true,
    feedback: true,
    minimizable: true,
  },
  styling: {
    botMessageColor: {
      light: "bg-[#0a2f59]",
      dark: "bg-richblack-700",
    },
    userMessageColor: {
      light: "bg-blue-600",
      dark: "bg-blue-700",
    },
  },
};
