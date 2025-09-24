// Amélioration du chatbotController.js
exports.getChatbotResponse = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Analyse plus sophistiquée avec scoring
    const response = analyzeMessage(message, conversationHistory);

    // Générer des suggestions basées sur la réponse
    const suggestions = generateSuggestions(message, response);

    return res.status(200).json({
      success: true,
      response: {
        text: response,
        suggestions: suggestions,
      },
    });
  } catch (error) {
    console.error("Error in getChatbotResponse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while processing chatbot request",
    });
  }
};

// Fonction d'analyse plus sophistiquée
const analyzeMessage = (message, history = []) => {
  const lowerCaseMessage = message.toLowerCase();

  // Patterns plus précis avec scoring
  const patterns = [
    {
      keywords: ["bonjour", "salut", "hello", "coucou", "hey"],
      response:
        "Bonjour ! Comment puis-je vous aider avec votre apprentissage aujourd'hui ?",
      score: 0,
    },
    {
      keywords: ["cours", "formation", "apprendre", "étudier", "leçon"],
      response:
        "Nous proposons de nombreuses formations dans différentes catégories. Vous pouvez les explorer dans la section 'Formations' ou me demander des recommandations basées sur vos intérêts.",
      score: 0,
    },
    {
      keywords: ["prix", "coût", "tarif", "payant", "gratuit"],
      response:
        "Nos formations ont différents tarifs. Certaines sont gratuites, d'autres payantes. Consultez la page de chaque formation pour voir les détails.",
      score: 0,
    },
    // Plus de patterns...
  ];

  // Calculer le score pour chaque pattern
  patterns.forEach((pattern) => {
    pattern.score = pattern.keywords.reduce((score, keyword) => {
      return lowerCaseMessage.includes(keyword) ? score + 1 : score;
    }, 0);
  });

  // Trouver la meilleure correspondance
  const bestMatch = patterns.reduce(
    (best, current) => (current.score > best.score ? current : best),
    {
      score: 0,
      response:
        "Désolé, je n'ai pas bien compris votre question. Pourriez-vous être plus précis ou me poser une question sur les cours, les quiz ou les certificats ?",
    }
  );

  return bestMatch.response;
};

// Générer des suggestions contextuelles
const generateSuggestions = (message, response) => {
  const lowerCaseMessage = message.toLowerCase();

  if (
    lowerCaseMessage.includes("cours") ||
    lowerCaseMessage.includes("formation")
  ) {
    return [
      "Voir les formations populaires",
      "Formations gratuites",
      "Comment s'inscrire ?",
    ];
  } else if (lowerCaseMessage.includes("certificat")) {
    return [
      "Comment obtenir un certificat ?",
      "Validité des certificats",
      "Afficher mes certificats",
    ];
  } else if (
    lowerCaseMessage.includes("quiz") ||
    lowerCaseMessage.includes("examen")
  ) {
    return ["Préparer un examen", "Refaire un quiz", "Politique de notation"];
  }

  // Suggestions par défaut
  return ["Voir les formations", "Mon tableau de bord", "Contacter le support"];
};
