
const Certificate = require("../models/certificate");
const Course = require("../models/course");
const QuizResult = require("../models/quizResult");
const path = require("path");
const fs = require("fs-extra");
const { createNotification } = require("./notificationController");
// Fonction helper pour vérifier les droits d'accès (instructeur ou admin)
const checkInstructorOrAdminAccess = async (
  courseId,
  userId,
  userAccountType
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Cours non trouvé");
  }

  // Permettre l'accès si c'est l'instructeur du cours OU un admin
  if (course.instructor.toString() !== userId && userAccountType !== "Admin") {
    throw new Error("Non autorisé");
  }

  return course;
};

// Fonction pour uploader les certificats en stockage local
const uploadCertificateToLocalStorage = async (file, folder) => {
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

// Upload certificat par l'instructeur
exports.uploadCertificate = async (req, res) => {
  try {
    const { courseId, studentId, quizResultId } = req.body;
    const certificateFile = req.files?.certificate;

    if (!certificateFile) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un fichier de certificat",
      });
    }

    try {
      // Utiliser la fonction helper pour vérifier les droits
      await checkInstructorOrAdminAccess(
        courseId,
        req.user.id,
        req.user.accountType
      );
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Vérifier que l'étudiant a réussi l'examen
    const quizResult = await QuizResult.findById(quizResultId);
    if (!quizResult || !quizResult.passed) {
      return res.status(400).json({
        success: false,
        message: "L'étudiant n'a pas réussi l'examen",
      });
    }

    // Récupérer les informations du cours
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé",
      });
    }

    // Upload du certificat en local
    const uploadedFile = await uploadCertificateToLocalStorage(
      certificateFile,
      `${process.env.FOLDER_NAME}/certificates`
    );

    // Créer le certificat
    const certificate = await Certificate.create({
      course: courseId,
      student: studentId,
      instructor: req.user.id,
      certificateUrl: uploadedFile.secure_url,
      quizResult: quizResultId,
    });

    // Créer une notification uniquement pour l'étudiant concerné
    const notificationMessage = `Félicitations ! Votre certificat pour le cours "${course.courseName}" est disponible.`;
    const notificationType = "new-certificate";
    const notificationTarget = `/dashboard/student-certificates`; 

    // Créer la notification pour l'étudiant spécifique
    createNotification(
      studentId,
      notificationMessage,
      notificationType,
      notificationTarget
    );

    res.status(200).json({
      success: true,
      message: "Certificat uploadé avec succès",
      data: certificate,
    });
  } catch (error) {
    console.error("UPLOAD_CERTIFICATE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload du certificat",
      error: error.message,
    });
  }
};

// Récupérer les certificats d'un étudiant
exports.getStudentCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificates = await Certificate.find({
      student: studentId,
    })
      .populate("course", "courseName thumbnail")
      .populate("instructor", "firstName lastName");

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("GET_CERTIFICATES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des certificats",
      error: error.message,
    });
  }
};

// Récupérer un certificat spécifique
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.accountType === "Admin";

    const certificate = await Certificate.findById(certificateId)
      .populate("course", "courseName instructor")
      .populate("student", "firstName lastName email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificat non trouvé",
      });
    }

    // Vérifier que l'utilisateur est soit l'étudiant, soit l'instructeur, soit un admin
    if (
      certificate.student._id.toString() !== userId &&
      certificate.course.instructor.toString() !== userId &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("GET_CERTIFICATE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du certificat",
      error: error.message,
    });
  }
};

// Télécharger un certificat
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.accountType === "Admin";

    const certificate = await Certificate.findById(certificateId)
      .populate("course", "courseName instructor")
      .populate("student", "firstName lastName");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificat non trouvé",
      });
    }

    // Vérifier que l'utilisateur est soit l'étudiant, soit l'instructeur, soit un admin
    if (
      certificate.student._id.toString() !== userId &&
      certificate.course.instructor.toString() !== userId &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    // Vérifier si l'URL est une URL locale
    if (certificate.certificateUrl.startsWith("/uploads/")) {
      // Construire le chemin absolu vers le fichier
      const filePath = path.join(
        __dirname,
        "../public",
        certificate.certificateUrl
      );

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
        `attachment; filename="certificat-${certificate.course.courseName}.pdf"`
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
    console.error("DOWNLOAD_CERTIFICATE_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement du certificat",
      error: error.message,
    });
  }
};

// Récupérer les étudiants éligibles pour un certificat (pour l'instructeur)
exports.getEligibleStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    try {
      await checkInstructorOrAdminAccess(
        courseId,
        req.user.id,
        req.user.accountType
      );
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Vérifier que le cours est certifiant
    const course = await Course.findById(courseId);
    if (!course.isCertified) {
      return res.status(400).json({
        success: false,
        message: "Ce cours n'est pas certifiant",
      });
    }

    // Trouver les étudiants qui ont réussi l'examen final
    const passedQuizResults = await QuizResult.find({
      quiz: course.finalQuiz,
      passed: true,
    }).populate("user", "firstName lastName email");

    // Trouver les certificats déjà émis
    const existingCertificates = await Certificate.find({
      course: courseId,
    }).select("student");

    // Filtrer les étudiants qui n'ont pas encore de certificat
    const existingCertificateStudentIds = existingCertificates.map((cert) =>
      cert.student.toString()
    );

    const eligibleStudents = passedQuizResults
      .filter(
        (result) =>
          !existingCertificateStudentIds.includes(result.user._id.toString())
      )
      .map((result) => ({
        _id: result.user._id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        quizResultId: result._id,
        score: result.score,
        passedAt: result.endTime,
      }));

    res.status(200).json({
      success: true,
      data: eligibleStudents,
    });
  } catch (error) {
    console.error("GET_ELIGIBLE_STUDENTS_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des étudiants éligibles",
      error: error.message,
    });
  }
};

// Récupérer les certificats émis pour un cours (pour l'instructeur)
exports.getCourseCertificates = async (req, res) => {
  try {
    const { courseId } = req.params;

    try {
      await checkInstructorOrAdminAccess(
        courseId,
        req.user.id,
        req.user.accountType
      );
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    const certificates = await Certificate.find({
      course: courseId,
    })
      .populate("student", "firstName lastName email")
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("GET_COURSE_CERTIFICATES_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des certificats",
      error: error.message,
    });
  }
};
