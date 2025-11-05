exports.getChatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let botResponse =
      "Désolé, je n'ai pas bien compris votre question. Pourriez-vous être plus précis ou me poser une question sur les cours, les quiz ou les certificats ?";

    const lowerCaseMessage = message.toLowerCase();

    if (
      lowerCaseMessage.includes("bonjour") ||
      lowerCaseMessage.includes("salut")
    ) {
      botResponse =
        "Bonjour ! Comment puis-je vous aider avec votre apprentissage aujourd'hui ?";
    } else if (
      lowerCaseMessage.includes("cours") ||
      lowerCaseMessage.includes("formation")
    ) {
      botResponse =
        "Nous proposons de nombreux formations dans différentes catégories. Vous pouvez les explorer dans la section 'Formations' ou me demander des recommandations basées sur vos intérêts.";
    } else if (
      lowerCaseMessage.includes("quiz") ||
      lowerCaseMessage.includes("examen")
    ) {
      botResponse =
        "Les examens sont disponibles à la fin de chaque formation. Ils vous permettent de tester vos connaissances et d'obtenir des certificats.";
    } else if (lowerCaseMessage.includes("certificat")) {
      botResponse =
        "Vous pouvez obtenir un certificat en terminant une formation et en réussissant l'examen final. Les certificats sont disponibles dans votre tableau de bord.";
    } else if (lowerCaseMessage.includes("merci")) {
      botResponse =
        "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
    } else if (
      lowerCaseMessage.includes("aide") ||
      lowerCaseMessage.includes("problème")
    ) {
      botResponse =
        "Si vous rencontrez un problème technique ou avez besoin d'aide spécifique, veuillez contacter notre support via la page 'Contact'.";
    }

    return res.status(200).json({
      success: true,
      response: botResponse,
    });
  } catch (error) {
    console.error("Error in getChatbotResponse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while processing chatbot request",
    });
  }
};
