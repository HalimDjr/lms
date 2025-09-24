// controllers/instructorApplicationController.js
const InstructorApplication = require("../models/instructorApplication");
const User = require("../models/user");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
const { accountCreated } = require("../mail/templates/accountCreated");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs-extra");
const { createNotification } = require("./notificationController");

// Fonction pour uploader les CV en stockage local
const uploadCVToLocalStorage = async (file, folder) => {
  // Créer le dossier de destination s'il n'existe pas
  const uploadDir = path.join(__dirname, "../public/uploads", folder);
  fs.ensureDirSync(uploadDir);

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const cleanFileName = file.name.split(".")[0].trim().replace(/\s+/g, "-");
  const fileExtension = path.extname(file.name);
  const uniqueFilename = `${timestamp}-${cleanFileName}${fileExtension}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // Déplacer le fichier temporaire vers le dossier de destination
  await fs.move(file.tempFilePath, filePath);

  // Créer l'URL relative pour accéder au fichier
  const fileUrl = `/uploads/${folder}/${uniqueFilename}`;

  return {
    secure_url: fileUrl,
    public_id: uniqueFilename,
    original_filename: file.name,
  };
};

// Soumettre une candidature de formateur
exports.submitApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      school,
      contactNumber,
    } = req.body;
    // Vérifier si tous les champs requis sont présents
    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !gender ||
      !school ||
      !contactNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis",
        missingFields: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          dateOfBirth: !dateOfBirth,
          gender: !gender,
          school: !school,
          contactNumber: !contactNumber,
        },
      });
    }

    // Vérifier si le fichier CV est présent
    if (!req.files || !req.files.cv) {
      return res.status(400).json({
        success: false,
        message: "Le CV est requis",
      });
    }

    // Vérifier si l'email existe déjà dans les utilisateurs
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé par un utilisateur existant",
      });
    }

    // Vérifier si une candidature avec cet email existe déjà
    const existingApplication = await InstructorApplication.findOne({ email });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Une candidature avec cet email existe déjà",
      });
    }

    // Vérifier le type de fichier
    const cvFile = req.files.cv;
    if (cvFile.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Format de fichier non supporté. Veuillez télécharger un PDF.",
      });
    }

    // Upload du CV en local
    const uploadedCV = await uploadCVToLocalStorage(
      cvFile,
      `instructor-applications`
    );

    // Créer la candidature
    const application = await InstructorApplication.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      school,
      contactNumber,
      cv: uploadedCV.secure_url,
    });

    // Envoyer un email de confirmation
    try {
      await mailSender(
        email,
        "Candidature de formateur reçue",
        `<h1>Merci pour votre candidature</h1>
                <p>Cher(e) ${firstName} ${lastName},</p>
                <p>Nous avons bien reçu votre candidature pour devenir formateur. Notre équipe va l'examiner et vous contactera prochainement.</p>
                <p>Cordialement,<br>L'équipe EPB Learning</p>`
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      // Ne pas bloquer la création de la candidature si l'email échoue
    }

    // Envoyer une notification à tous les administrateurs
    try {
      // Trouver tous les administrateurs
      const admins = await User.find({ accountType: "Admin" });

      if (admins && admins.length > 0) {
        const notificationMessage = `Nouvelle candidature de formateur reçue`;
        const notificationType = "new-instructor-application";
        const notificationTarget = `dashboard/instructor-applications`;

        // Envoyer une notification à chaque administrateur
        for (const admin of admins) {
          await createNotification(
            admin._id,
            notificationMessage,
            notificationType,
            notificationTarget
          );
        }

        console.log(
          `Notifications envoyées à ${admins.length} administrateurs.`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des notifications aux administrateurs:",
        error
      );
      // Ne pas bloquer la création de la candidature si les notifications échouent
    }

    res.status(201).json({
      success: true,
      message: "Candidature soumise avec succès",
      data: application,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission de la candidature:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission de la candidature",
      error: error.message,
    });
  }
};

// Obtenir toutes les candidatures (pour l'admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const applications = await InstructorApplication.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des candidatures",
      error: error.message,
    });
  }
};

// Obtenir une candidature par ID
exports.getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la candidature",
      error: error.message,
    });
  }
};

// Télécharger un CV
exports.downloadCV = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    // Vérifier si l'URL est une URL locale
    if (application.cv.startsWith("/uploads/")) {
      // Construire le chemin absolu vers le fichier
      const filePath = path.join(__dirname, "../public", application.cv);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé sur le serveur",
        });
      }

      // Définir les en-têtes pour le téléchargement
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="cv-${application.firstName}-${application.lastName}.pdf"`
      );

      // Envoyer le fichier
      return res.sendFile(filePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "Format d'URL non pris en charge",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement du CV",
      error: error.message,
    });
  }
};

// Mettre à jour le statut d'une candidature
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status || !["En attente", "Accepté", "Refusé"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    // Si la candidature est acceptée, créer un compte instructeur
    if (status === "Accepté" && application.status !== "Accepté") {
      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = await User.findOne({ email: application.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Un utilisateur avec cet email existe déjà",
        });
      }

      // Créer un profil pour l'instructeur
      const profileDetails = await Profile.create({
        gender: application.gender,
        dateOfBirth: application.dateOfBirth,
        contactNumber: application.contactNumber,
        ecole: application.school,
      });

      // Générer un mot de passe aléatoire
      const password = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur instructeur
      const user = await User.create({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        password: hashedPassword,
        accountType: "Instructor",
        approved: true,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${application.firstName} ${application.lastName}`,
      });

      // Envoyer un email avec les identifiants
      // When sending email after accepting application
      try {
        await mailSender(
          application.email,
          "Félicitations - Votre candidature a été acceptée",
          accountCreated(
            application.email,
            password,
            application.firstName,
            "Votre candidature pour devenir formateur a été acceptée. Vous pouvez maintenant vous connecter avec les identifiants ci-dessous."
          )
        );
        console.log(
          "Acceptance email sent successfully to:",
          application.email
        );
      } catch (error) {
        console.error("Failed to send acceptance email:", error);
        // Still continue with the process even if email fails
      }
    } else if (status === "Refusé" && application.status !== "Refusé") {
      // Envoyer un email de refus
      try {
        await mailSender(
          application.email,
          "Candidature de formateur - Réponse",
          `<h1>Réponse à votre candidature</h1>
                    <p>Cher(e) ${application.firstName} ${application.lastName},</p>
                    <p>Nous vous remercions pour l'intérêt que vous portez à notre plateforme. Après examen de votre candidature, nous sommes au regret de vous informer que nous ne pouvons pas y donner suite favorablement pour le moment.</p>
                    <p>Nous vous encourageons à postuler à nouveau dans le futur.</p>
                    <p>Cordialement,<br>L'équipe EPB Learning</p>`
        );
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        // Ne pas bloquer la mise à jour si l'email échoue
      }
    }

    // Mettre à jour le statut de la candidature
    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Candidature ${status.toLowerCase()} avec succès`,
      data: application,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la candidature:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la candidature",
      error: error.message,
    });
  }
};

// Supprimer une candidature
exports.deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    // Si le CV est stocké localement, supprimer le fichier
    if (application.cv.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../public", application.cv);
      if (fs.existsSync(filePath)) {
        await fs.remove(filePath);
      }
    }

    await InstructorApplication.findByIdAndDelete(applicationId);

    res.status(200).json({
      success: true,
      message: "Candidature supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la candidature:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la candidature",
      error: error.message,
    });
  }
};
