const Complaint = require("../models/complaint");
const User = require("../models/user");
const { createNotification } = require("./notificationController");

// Soumettre une réclamation
exports.submitComplaint = async (req, res) => {
  try {
    const { subject, description, category, attachments } = req.body;
    const userId = req.user.id;

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir toutes les informations requises.",
      });
    }

    // Créer la réclamation
    const complaint = await Complaint.create({
      user: userId,
      subject,
      description,
      category,
      attachments: attachments || [],
    });


    const admins = await User.find({ accountType: "Admin" });

    // Envoyer une notification à chaque administrateur
    admins.forEach((admin) => {
      createNotification(
        admin._id,
        `Nouvelle réclamation: "${subject}" soumise par un utilisateur.`,
        "new-complaint",
        `/dashboard/settings`
      );
    });

    // Envoyer une notification à l'utilisateur
    createNotification(
      userId,
      "Votre réclamation a été soumise avec succès et sera examinée par notre équipe.",
      "complaint-submitted",
      "/dashboard/settings"
    );

    return res.status(201).json({
      success: true,
      message: "Réclamation soumise avec succès.",
      data: complaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission de la réclamation.",
      error: error.message,
    });
  }
};

// Obtenir les réclamations d'un utilisateur
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const complaints = await Complaint.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réclamations.",
      error: error.message,
    });
  }
};

// Obtenir toutes les réclamations (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé.",
      });
    }

    const complaints = await Complaint.find()
      .populate("user", "firstName lastName email accountType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réclamations.",
      error: error.message,
    });
  }
};

// Traiter une réclamation
exports.processComplaint = async (req, res) => {
  try {
    const { complaintId, status, adminResponse } = req.body;
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé.",
      });
    }

    if (
      !complaintId ||
      !status ||
      !["pending", "in-progress", "resolved", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Informations invalides.",
      });
    }

    // Trouver la réclamation
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Réclamation introuvable.",
      });
    }

    // Mettre à jour le statut de la réclamation
    complaint.status = status;
    complaint.adminResponse = adminResponse || complaint.adminResponse;
    complaint.updatedAt = Date.now();

    if (status === "resolved") {
      complaint.resolvedAt = Date.now();
    }

    await complaint.save();

    // Envoyer une notification à l'utilisateur
    let notificationMessage;
    let notificationType;

    if (status === "in-progress") {
      notificationMessage = `Votre réclamation "${complaint.subject}" est en cours de traitement.`;
      notificationType = "complaint-in-progress";
    } else if (status === "resolved") {
      notificationMessage = `Votre réclamation "${complaint.subject}" a été résolue.`;
      notificationType = "complaint-resolved";
    } else if (status === "rejected") {
      notificationMessage = `Votre réclamation "${complaint.subject}" a été rejetée.`;
      notificationType = "complaint-rejected";
    }

    if (notificationMessage) {
      createNotification(
        complaint.user,
        notificationMessage,
        notificationType,
        "/dashboard/settings"
      );
    }

    return res.status(200).json({
      success: true,
      message: `Réclamation mise à jour avec succès.`,
      data: complaint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement de la réclamation.",
      error: error.message,
    });
  }
};
