const ForumMessage = require("../models/forumMessage");
const SubSection = require("../models/subSection");
const User = require("../models/user");

// Récupérer tous les messages d'une subsection
exports.getForumMessages = async (req, res) => {
  try {
    const { subsectionId } = req.params;

    // Vérification si la subsection existe
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "SubSection introuvable",
      });
    }

    // Récupération des messages principaux (pas les réponses)
    const messages = await ForumMessage.find({
      subSection: subsectionId,
      parentMessage: null,
    })
      .populate({
        path: "user",
        select: "firstName lastName image",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "firstName lastName image",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: messages,
      message: "Messages du forum récupérés avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des messages du forum:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages du forum",
      error: error.message,
    });
  }
};

// Créer un nouveau message
exports.createMessage = async (req, res) => {
  try {
    const { content, subsectionId, parentMessageId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!content || !subsectionId) {
      return res.status(400).json({
        success: false,
        message: "Le contenu et l'ID de la subsection sont requis",
      });
    }

    // Vérification si la subsection existe
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "SubSection introuvable",
      });
    }

    const messageData = {
      content,
      subSection: subsectionId,
      user: userId,
      parentMessage: parentMessageId || null,
    };

    // Créer le message dans la DB
    const newMessage = await ForumMessage.create(messageData);

    // Si c'est une réponse, ajouter à la liste des réponses du message parent
    if (parentMessageId) {
      await ForumMessage.findByIdAndUpdate(
        parentMessageId,
        { $push: { replies: newMessage._id } },
        { new: true }
      );
    }

    // Populer les informations utilisateur pour la réponse
    const populatedMessage = await ForumMessage.findById(
      newMessage._id
    ).populate({
      path: "user",
      select: "firstName lastName image",
    });

    return res.status(201).json({
      success: true,
      data: populatedMessage,
      message: "Message créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du message:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du message",
      error: error.message,
    });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Récupérer le message
    const message = await ForumMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    // Vérifier si l'utilisateur est le propriétaire du message ou un admin
    if (
      message.user.toString() !== userId &&
      req.user.accountType !== "Admin" &&
      req.user.accountType !== "Instructor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer ce message",
      });
    }

    // Si c'est un message parent, supprimer également toutes les réponses
    if (!message.parentMessage) {
      await ForumMessage.deleteMany({ parentMessage: messageId });
    } else {
      // Si c'est une réponse, la retirer de la liste des réponses du message parent
      await ForumMessage.findByIdAndUpdate(message.parentMessage, {
        $pull: { replies: messageId },
      });
    }

    // Supprimer le message
    await ForumMessage.findByIdAndDelete(messageId);

    return res.status(200).json({
      success: true,
      message: "Message supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du message",
      error: error.message,
    });
  }
};

// Liker/Unliker un message
exports.toggleLikeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Vérifier si le message existe
    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    // Vérifier si l'utilisateur a déjà liké le message
    const likeIndex = message.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Si l'utilisateur n'a pas encore liké, ajouter son like
      message.likes.push(userId);
    } else {
      // Si l'utilisateur a déjà liké, retirer son like
      message.likes.splice(likeIndex, 1);
    }

    await message.save();

    // Récupérer le message mis à jour avec les informations de l'utilisateur
    const updatedMessage = await ForumMessage.findById(messageId)
      .populate({
        path: "user",
        select: "firstName lastName image accountType",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "firstName lastName image accountType",
        },
      });

    return res.status(200).json({
      success: true,
      data: updatedMessage,
      message: likeIndex === -1 ? "Message liké" : "Like retiré",
    });
  } catch (error) {
    console.error("Erreur lors du like/unlike du message:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du like/unlike du message",
      error: error.message,
    });
  }
};

// Épingler/Désépingler un message
exports.togglePinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user;

    // Vérifier si l'utilisateur est un instructeur ou un admin
    if (!["Admin", "Instructor"].includes(user.accountType)) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à épingler des messages",
      });
    }

    // Vérifier si le message existe
    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    // Inverser l'état d'épinglage
    message.isPinned = !message.isPinned;
    await message.save();

    // Récupérer le message mis à jour avec les informations de l'utilisateur
    const updatedMessage = await ForumMessage.findById(messageId)
      .populate({
        path: "user",
        select: "firstName lastName image accountType",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "firstName lastName image accountType",
        },
      });

    return res.status(200).json({
      success: true,
      data: updatedMessage,
      message: message.isPinned ? "Message épinglé" : "Message désépinglé",
    });
  } catch (error) {
    console.error("Erreur lors de l'épinglage/désépinglage du message:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'épinglage/désépinglage du message",
      error: error.message,
    });
  }
};

// Marquer un message comme solution
exports.toggleSolutionStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { subsectionId } = req.body;
    const user = req.user;

    // Vérifier si l'utilisateur est un instructeur ou un admin
    if (!["Admin", "Instructor"].includes(user.accountType)) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à marquer des solutions",
      });
    }

    // Vérifier si le message existe
    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    // Si on marque comme solution, retirer le statut de solution des autres messages
    if (!message.isSolution) {
      await ForumMessage.updateMany(
        { subSection: subsectionId, isSolution: true },
        { isSolution: false }
      );
    }

    // Inverser le statut de solution
    message.isSolution = !message.isSolution;
    await message.save();

    // Récupérer le message mis à jour avec les informations de l'utilisateur
    const updatedMessage = await ForumMessage.findById(messageId)
      .populate({
        path: "user",
        select: "firstName lastName image accountType",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "firstName lastName image accountType",
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        messageId: message._id,
        subsectionId,
        message: updatedMessage,
      },
      message: message.isSolution
        ? "Message marqué comme solution"
        : "Statut de solution retiré",
    });
  } catch (error) {
    console.error("Erreur lors du marquage comme solution:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du marquage comme solution",
      error: error.message,
    });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Vérifier si le message existe
    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    // Vérifier si l'utilisateur est le propriétaire du message ou un admin/instructeur
    if (
      message.user.toString() !== userId &&
      !["Admin", "Instructor"].includes(req.user.accountType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier ce message",
      });
    }

    // Mettre à jour le contenu du message
    message.content = content;
    await message.save();

    // Récupérer le message mis à jour avec les informations de l'utilisateur
    const updatedMessage = await ForumMessage.findById(messageId)
      .populate({
        path: "user",
        select: "firstName lastName image accountType",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "firstName lastName image accountType",
        },
      });

    return res.status(200).json({
      success: true,
      data: updatedMessage,
      message: "Message mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du message:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du message",
      error: error.message,
    });
  }
};
