const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
require("dotenv").config();

const User = require("../models/user");
const Course = require("../models/course");
const SubSectionQuizResult = require("../models/SubSectionQuizResult");
const QuizResult = require("../models/quizResult");
const RatingAndReview = require("../models/ratingAndReview");
const CourseProgress = require("../models/courseProgress");
const { default: mongoose } = require("mongoose");
const { createNotification } = require("./notificationController");
const UnenrollmentRequest = require("../models/unenrollmentRequest");

// ================ Inscription  à un cours ================
exports.enrollFreeCourse = async (req, res) => {
  // Extraire courseId & userId
  const { coursesId } = req.body;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est un étudiant
  if (req.user.accountType !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Seuls les étudiants peuvent s'inscrire aux cours.",
    });
  }

  if (!coursesId || coursesId.length === 0) {
    return res.json({
      success: false,
      message: "Veuillez fournir un ID de cours.",
    });
  }

  for (const course_id of coursesId) {
    let course;
    try {
      // Vérifier si le cours existe
      course = await Course.findById(course_id).populate("instructor");
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Cours introuvable." });
      }

      // Vérifier si l'utilisateur est déjà inscrit
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(400)
          .json({ success: false, message: "L'étudiant est déjà inscrit." });
      }

      await enrollStudent(course_id, userId);

      // Récupérer les informations de l'étudiant
      const student = await User.findById(userId);

      // Envoyer une notification à l'instructeur du cours
      const instructorNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} s'est inscrit à votre cours "${course.courseName}".`;
      const notificationType = "new-enrollment";
      const notificationTarget = `dashboard/instructor`;

      // Notification à l'instructeur
      createNotification(
        course.instructor._id,
        instructorNotificationMessage,
        notificationType,
        notificationTarget
      );

      // Trouver tous les administrateurs et leur envoyer une notification
      const admins = await User.find({ accountType: "Admin" });

      const adminNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} s'est inscrit au cours "${course.courseName}".`;
      const adminNotificationTarget = `/admin/courses/${course_id}`;

      // Envoyer une notification à chaque administrateur
      admins.forEach((admin) => {
        createNotification(
          admin._id,
          adminNotificationMessage,
          notificationType,
          adminNotificationTarget
        );
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res
    .status(200)
    .json({ success: true, message: "Inscription réussie." });
};

// ================ Fonction d'inscription de l'étudiant ================
const enrollStudent = async (courseId, userId) => {
  try {
    // Ajouter l'utilisateur à la liste des étudiants inscrits
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error("Cours introuvable.");
    }

    // Initialiser la progression du cours
    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    });

    // Ajouter le cours à la liste des cours de l'étudiant
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    // Envoyer un email de confirmation
    await mailSender(
      enrolledStudent.email,
      `Inscription réussie dans ${enrolledCourse.courseName}`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName}`
      )
    );
  } catch (error) {
    console.log(error);
    throw new Error("Erreur lors de l'inscription de l'étudiant.");
  }
};

exports.unenrollFromCourse = async (req, res) => {
  try {
    // Extraire courseId & userId
    const { courseId } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est un étudiant
    if (req.user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Seuls les étudiants peuvent se désinscrire des cours.",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un ID de cours.",
      });
    }

    // Vérifier si le cours existe
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Cours introuvable." });
    }

    // Vérifier si l'utilisateur est inscrit
    const uid = new mongoose.Types.ObjectId(userId);
    if (!course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "L'étudiant n'est pas inscrit à ce cours.",
      });
    }

    // Récupérer les informations de l'étudiant
    const student = await User.findById(userId);

    // Retirer l'étudiant du cours
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { studentsEnrolled: userId } },
      { new: true }
    );

    // Retirer le cours de la liste des cours de l'étudiant
    await User.findByIdAndUpdate(
      userId,
      { $pull: { courses: courseId } },
      { new: true }
    );

    // Supprimer la progression du cours
    await CourseProgress.findOneAndDelete({
      courseID: courseId,
      userId: userId,
    });

    // Envoyer une notification à l'instructeur du cours
    const instructorNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} s'est désinscrit de votre cours "${course.courseName}" après avoir échoué au quiz final.`;
    const notificationType = "course-unenrollment";
    const notificationTarget = `dashboard/instructor`;

    // Notification à l'instructeur
    createNotification(
      course.instructor._id,
      instructorNotificationMessage,
      notificationType,
      notificationTarget
    );

    // Trouver tous les administrateurs et leur envoyer une notification
    const admins = await User.find({ accountType: "Admin" });

    const adminNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} s'est désinscrit du cours "${course.courseName}" après avoir échoué a l'examen final.`;
    const adminNotificationTarget = `/admin/courses/${courseId}`;

    // Envoyer une notification à chaque administrateur
    admins.forEach((admin) => {
      createNotification(
        admin._id,
        adminNotificationMessage,
        notificationType,
        adminNotificationTarget
      );
    });

    return res
      .status(200)
      .json({ success: true, message: "Désinscription réussie." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================ Demande de désinscription ================
exports.requestUnenrollment = async (req, res) => {
  try {
    const { courseId, quizId, reason } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est un étudiant
    if (req.user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Seuls les étudiants peuvent demander une désinscription.",
      });
    }

    if (!courseId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir toutes les informations requises.",
      });
    }

    // Vérifier si le cours existe
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Cours introuvable." });
    }

    // Vérifier si l'utilisateur est inscrit
    const student = await User.findById(userId);
    if (!student.courses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "L'étudiant n'est pas inscrit à ce cours.",
      });
    }

    // Vérifier si une demande est déjà en cours
    const existingRequest = await UnenrollmentRequest.findOne({
      student: userId,
      course: courseId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "Une demande de désinscription est déjà en cours pour ce cours.",
      });
    }

    // Créer la demande de désinscription
    const unenrollmentRequest = await UnenrollmentRequest.create({
      student: userId,
      course: courseId,
      quiz: quizId,
      reason,
    });

    // Envoyer une notification à l'instructeur du cours
    const instructorNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} a demandé à se désinscrire de votre cours "${course.courseName}".`;
    const notificationType = "unenrollment-request";
    const notificationTarget = `dashboard/instructor`;

    // Notification à l'instructeur
    createNotification(
      course.instructor._id,
      instructorNotificationMessage,
      notificationType,
      notificationTarget
    );

    // Trouver tous les administrateurs et leur envoyer une notification
    const admins = await User.find({ accountType: "Admin" });

    const adminNotificationMessage = `L'étudiant ${student.firstName} ${student.lastName} a demandé à se désinscrire du cours "${course.courseName}". Veuillez examiner cette demande.`;
    const adminNotificationTarget = `dashboard/unenrollment-requests`;

    // Envoyer une notification à chaque administrateur
    admins.forEach((admin) => {
      createNotification(
        admin._id,
        adminNotificationMessage,
        notificationType,
        adminNotificationTarget
      );
    });

    // Notification à l'étudiant
    {
      /*createNotification(
      userId,
      `Votre demande de désinscription du cours "${course.courseName}" a été soumise et est en attente d'approbation.`,
      "unenrollment-request-submitted",
      "/dashboard/enrolled-courses"
    );*/
    }

    return res.status(200).json({
      success: true,
      message: "Demande de désinscription soumise avec succès.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================ Récupérer les demandes de désinscription d'un étudiant ================
exports.getStudentUnenrollmentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await UnenrollmentRequest.find({ student: userId })
      .populate("course", "courseName thumbnail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================ Récupérer toutes les demandes de désinscription (admin) ================
exports.getAllUnenrollmentRequests = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé.",
      });
    }

    const requests = await UnenrollmentRequest.find()
      .populate("student", "firstName lastName email")
      .populate("course", "courseName thumbnail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================ Traiter une demande de désinscription (admin) ================
exports.processUnenrollmentRequest = async (req, res) => {
  try {
    const { requestId, status, adminComment } = req.body;

    // Vérifier que l'utilisateur est un administrateur
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé.",
      });
    }

    if (!requestId || !status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Informations invalides.",
      });
    }

    // Trouver la demande
    const request = await UnenrollmentRequest.findById(requestId)
      .populate("student")
      .populate("course");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Demande introuvable.",
      });
    }

    // Mettre à jour le statut de la demande
    request.status = status;
    request.adminComment = adminComment || "";
    request.updatedAt = Date.now();
    await request.save();

    // Si la demande est approuvée, désinscrire l'étudiant et nettoyer toutes les données associées
    if (status === "approved") {
      const studentId = request.student._id;
      const courseId = request.course._id;

      // 1. Retirer l'étudiant du cours
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: studentId } },
        { new: true }
      );

      // 2. Retirer le cours de la liste des cours de l'étudiant
      await User.findByIdAndUpdate(
        studentId,
        { $pull: { courses: courseId } },
        { new: true }
      );

      // 3. Supprimer la progression du cours
      await CourseProgress.findOneAndDelete({
        courseID: courseId,
        userId: studentId,
      });

      // 4. Supprimer les résultats des quiz de sous-sections pour ce cours
      // D'abord, trouver toutes les sections du cours
      const course = await Course.findById(courseId).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });

      if (course && course.courseContent) {
        // Collecter tous les IDs de sous-sections
        const subSectionIds = [];
        course.courseContent.forEach((section) => {
          if (section.subSection && section.subSection.length > 0) {
            section.subSection.forEach((subSection) => {
              subSectionIds.push(subSection._id);
            });
          }
        });

        // Supprimer tous les résultats de quiz de sous-sections pour cet étudiant
        if (subSectionIds.length > 0) {
          await SubSectionQuizResult.deleteMany({
            user: studentId,
            subSection: { $in: subSectionIds },
          });
        }
      }

      // 5. Supprimer les résultats du quiz final du cours
      if (course && course.finalQuiz) {
        await QuizResult.deleteMany({
          user: studentId,
          quiz: course.finalQuiz,
        });
      }

      // 6. Supprimer les évaluations et avis de l'étudiant pour ce cours
      await RatingAndReview.deleteMany({
        user: studentId,
        course: courseId,
      });
    }

    // Envoyer une notification à l'étudiant
    const notificationMessage =
      status === "approved"
        ? `Votre demande de désinscription du cours "${request.course.courseName}" a été approuvée.`
        : `Votre demande de désinscription du cours "${
            request.course.courseName
          }" a été rejetée. Raison: ${
            adminComment || "Aucune raison fournie."
          }`;

    createNotification(
      request.student._id,
      notificationMessage,
      status === "approved" ? "unenrollment-approved" : "unenrollment-rejected",
      "/dashboard/enrolled-courses"
    );

    // Envoyer un email à l'étudiant
    const emailSubject =
      status === "approved"
        ? `Demande de désinscription approuvée - ${request.course.courseName}`
        : `Demande de désinscription rejetée - ${request.course.courseName}`;

    const emailBody = `
      <h1>${
        status === "approved"
          ? "Demande de désinscription approuvée"
          : "Demande de désinscription rejetée"
      }</h1>
      <p>Cher(e) ${request.student.firstName},</p>
      <p>Votre demande de désinscription du cours <strong>${
        request.course.courseName
      }</strong> a été ${status === "approved" ? "approuvée" : "rejetée"}.</p>
      ${
        status === "rejected" && adminComment
          ? `<p>Raison: ${adminComment}</p>`
          : ""
      }
      <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
      <p>Cordialement,<br>L'équipe EPBLearn</p>
    `;

    await mailSender(request.student.email, emailSubject, emailBody);

    return res.status(200).json({
      success: true,
      message: `Demande de désinscription ${
        status === "approved" ? "approuvée" : "rejetée"
      } avec succès.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Inscrire un étudiant à un cours 
exports.enrollStudentToCourse = async (req, res) => {
  try {
    const { studentId, coursesId } = req.body;

    // Vérifier que l'utilisateur est un admin
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent inscrire des étudiants",
      });
    }

    if (!studentId || !coursesId || coursesId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un ID d'étudiant et au moins un ID de cours",
      });
    }

    // Vérifier que l'étudiant existe
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable",
      });
    }

    // Vérifier que l'étudiant est bien un étudiant
    if (student.accountType !== "Student") {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur n'est pas un étudiant",
      });
    }

    const enrollmentResults = [];

    for (const courseId of coursesId) {
      // Vérifier si le cours existe
      const course = await Course.findById(courseId);
      if (!course) {
        enrollmentResults.push({
          courseId,
          success: false,
          message: "Cours introuvable",
        });
        continue;
      }

      // Vérifier si l'étudiant est déjà inscrit
      if (course.studentsEnrolled.includes(studentId)) {
        enrollmentResults.push({
          courseId,
          success: false,
          message: "L'étudiant est déjà inscrit à ce cours",
        });
        continue;
      }

      // Inscrire l'étudiant
      await Course.findByIdAndUpdate(
        courseId,
        { $push: { studentsEnrolled: studentId } },
        { new: true }
      );

      // Initialiser la progression du cours
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: studentId,
        completedVideos: [],
      });

      // Ajouter le cours à la liste des cours de l'étudiant
      await User.findByIdAndUpdate(
        studentId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      enrollmentResults.push({
        courseId,
        success: true,
        message: "Inscription réussie",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Processus d'inscription terminé",
      data: enrollmentResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription de l'étudiant",
      error: error.message,
    });
  }
};

// Inscrire plusieurs étudiants à un cours (par l'admin)
exports.enrollMultipleStudentsToCourse = async (req, res) => {
  try {
    const { studentIds, courseId } = req.body;

    // Vérifier que l'utilisateur est un admin
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent inscrire des étudiants",
      });
    }

    if (!studentIds || !studentIds.length || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir des IDs d'étudiants et un ID de cours",
      });
    }

    // Vérifier si le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable",
      });
    }

    const enrollmentResults = [];

    for (const studentId of studentIds) {
      // Vérifier que l'étudiant existe
      const student = await User.findById(studentId);
      if (!student) {
        enrollmentResults.push({
          studentId,
          success: false,
          message: "Étudiant introuvable",
        });
        continue;
      }

      // Vérifier que l'étudiant est bien un étudiant
      if (student.accountType !== "Student") {
        enrollmentResults.push({
          studentId,
          success: false,
          message: "L'utilisateur n'est pas un étudiant",
        });
        continue;
      }

      // Vérifier si l'étudiant est déjà inscrit
      if (course.studentsEnrolled.includes(studentId)) {
        enrollmentResults.push({
          studentId,
          success: false,
          message: "L'étudiant est déjà inscrit à ce cours",
        });
        continue;
      }

      // Inscrire l'étudiant
      await Course.findByIdAndUpdate(
        courseId,
        { $push: { studentsEnrolled: studentId } },
        { new: true }
      );

      // Initialiser la progression du cours
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: studentId,
        completedVideos: [],
      });

      // Ajouter le cours à la liste des cours de l'étudiant
      await User.findByIdAndUpdate(
        studentId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      enrollmentResults.push({
        studentId,
        success: true,
        message: "Inscription réussie",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Processus d'inscription multiple terminé",
      data: enrollmentResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription multiple",
      error: error.message,
    });
  }
};

// Inscription par l'admin
exports.enrollStudentToCourse = async (req, res) => {
  try {
    const { studentId, coursesId } = req.body;

    // Vérifier que l'utilisateur est un admin
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent inscrire des étudiants",
      });
    }

    // Vérifier que l'étudiant existe
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable",
      });
    }

    // Inscrire l'étudiant à chaque cours
    for (const courseId of coursesId) {
      const course = await Course.findById(courseId);
      if (!course) {
        continue; // Passer au cours suivant si celui-ci n'existe pas
      }

      // Vérifier si l'étudiant n'est pas déjà inscrit
      if (course.studentsEnrolled.includes(studentId)) {
        continue; // Passer au cours suivant si déjà inscrit
      }

      // Ajouter l'étudiant au cours
      course.studentsEnrolled.push(studentId);
      await course.save();

      // Créer une progression de cours pour l'étudiant
      await CourseProgress.create({
        courseID: courseId,
        userId: studentId,
        completedVideos: [],
      });

      // Ajouter le cours à la liste des cours de l'étudiant
      await User.findByIdAndUpdate(
        studentId,
        {
          $addToSet: { courses: courseId },
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Étudiant inscrit avec succès",
    });
  } catch (error) {
    console.error("ENROLL_STUDENT_ERROR", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription de l'étudiant",
      error: error.message,
    });
  }
};
