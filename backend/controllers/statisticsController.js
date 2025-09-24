// controllers/statisticsController.js
const User = require("../models/user");
const Course = require("../models/course");
const Quiz = require("../models/quiz");
const QuizResult = require("../models/quizResult");
const Certificate = require("../models/certificate");
const Category = require("../models/category");
const CourseProgress = require("../models/courseProgress");
const RatingAndReview = require("../models/ratingAndReview");
const Statistics = require("../models/statistics");
const Section = require("../models/section");
const SubSection = require("../models/subSection");

// Dans le composant QuizPerformance

exports.generateDailyStatistics = async (req, res) => {
  try {
    // 1. Statistiques des utilisateurs
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$accountType",
          count: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ["$active", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 2. Statistiques des cours
    const courseStats = await Course.aggregate([
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          enrollmentStats: [
            {
              $project: {
                enrollmentCount: {
                  $cond: {
                    if: { $isArray: "$studentsEnrolled" },
                    then: { $size: "$studentsEnrolled" },
                    else: 0,
                  },
                },
                isCertified: 1,
              },
            },
            {
              $group: {
                _id: null,
                totalEnrollments: { $sum: "$enrollmentCount" },
                certifiedCourses: {
                  $sum: {
                    $cond: [{ $eq: ["$isCertified", true] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // 3. Statistiques des quiz
    const quizStats = await Quiz.aggregate([
      {
        $lookup: {
          from: "quizresults",
          localField: "_id",
          foreignField: "quiz",
          as: "results",
        },
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: { $size: "$results" } },
          passedAttempts: {
            $sum: {
              $size: {
                $filter: {
                  input: "$results",
                  as: "result",
                  cond: { $eq: ["$$result.passed", true] },
                },
              },
            },
          },
          averageScore: {
            $avg: {
              $cond: {
                if: { $eq: [{ $size: "$results" }, 0] },
                then: 0,
                else: { $avg: "$results.score" },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          totalAttempts: 1,
          averageScore: 1,
          passRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $divide: ["$passedAttempts", "$totalAttempts"] },
            ],
          },
        },
      },
    ]);

    // 4. Statistiques des catégories
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courses",
          foreignField: "_id",
          as: "coursesData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1, // Assurez-vous que le nom est projeté
          coursesCount: { $size: "$coursesData" },
          enrollmentsCount: {
            $reduce: {
              input: "$coursesData",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $size: {
                      $ifNull: ["$$this.studentsEnrolled", []],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    // 5. Statistiques des certificats
    const certificateStats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
        },
      },
    ]);

    // 6. Statistiques de progression (corrigé pour éviter division par zéro)
    const progressStats = await CourseProgress.aggregate([
      {
        $lookup: {
          from: "subsections",
          localField: "completedVideos",
          foreignField: "_id",
          as: "completedContent",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseID",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: { path: "$courseInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$courseID",
          courseName: { $first: "$courseInfo.courseName" },
          averageCompletion: {
            $avg: {
              $cond: {
                if: { $eq: [{ $size: "$completedVideos" }, 0] },
                then: 0,
                else: {
                  $multiply: [
                    {
                      $divide: [
                        { $size: "$completedContent" },
                        { $max: [{ $size: "$completedVideos" }, 1] },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
      },
    ]);
    const statistics = await Statistics.create({
      totalUsers: {
        students: userStats.find((stat) => stat._id === "Student")?.count || 0,
        instructors:
          userStats.find((stat) => stat._id === "Instructor")?.count || 0,
        admins: userStats.find((stat) => stat._id === "Admin")?.count || 0,
      },
      coursesStats: {
        totalCourses:
          courseStats[0]?.statusStats?.reduce(
            (acc, curr) => acc + curr.count,
            0
          ) || 0,
        publishedCourses:
          courseStats[0]?.statusStats?.find((stat) => stat._id === "Published")
            ?.count || 0,
        draftCourses:
          courseStats[0]?.statusStats?.find((stat) => stat._id === "Draft")
            ?.count || 0,
        totalEnrollments:
          courseStats[0]?.enrollmentStats?.[0]?.totalEnrollments || 0,
        certifiedCourses:
          courseStats[0]?.enrollmentStats?.[0]?.certifiedCourses || 0, // Ajout ici
      },
      quizStats: {
        totalQuizzes: quizStats[0]?.totalQuizzes || 0,
        totalAttempts: quizStats[0]?.totalAttempts || 0,
        averageScore: quizStats[0]?.averageScore || 0,
        passRate: quizStats[0]?.passRate || 0,
      },
      certificatesIssued: certificateStats[0]?.totalCertificates || 0,
      categoryStats: categoryStats.map((cat) => ({
        category: cat._id,
        name: cat.name, // Stocker le nom directement
        coursesCount: cat.coursesCount || 0,
        enrollmentsCount: cat.enrollmentsCount || 0,
      })),
      dailyActiveUsers: userStats.reduce(
        (acc, curr) => acc + (curr.activeUsers || 0),
        0
      ),
      monthlyActiveUsers: userStats.reduce(
        (acc, curr) => acc + (curr.count || 0),
        0
      ),
      revenueStats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
      },
    });

    res.status(200).json({
      success: true,
      message: "Statistiques générées avec succès",
      data: statistics,
    });
  } catch (error) {
    console.error("Erreur lors de la génération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération des statistiques",
      error: error.message,
    });
  }
};

exports.generateNewStatistics = async () => {
  try {
    // 1. Statistiques des utilisateurs
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$accountType",
          count: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ["$active", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 2. Statistiques des cours
    const courseStats = await Course.aggregate([
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          enrollmentStats: [
            {
              $project: {
                enrollmentCount: {
                  $cond: {
                    if: { $isArray: "$studentsEnrolled" },
                    then: { $size: "$studentsEnrolled" },
                    else: 0,
                  },
                },
                isCertified: 1,
              },
            },
            {
              $group: {
                _id: null,
                totalEnrollments: { $sum: "$enrollmentCount" },
                certifiedCourses: {
                  $sum: {
                    $cond: [{ $eq: ["$isCertified", true] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // 3. Statistiques des quiz
    const quizStats = await Quiz.aggregate([
      {
        $lookup: {
          from: "quizresults",
          localField: "_id",
          foreignField: "quiz",
          as: "results",
        },
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: { $size: "$results" } },
          passedAttempts: {
            $sum: {
              $size: {
                $filter: {
                  input: "$results",
                  as: "result",
                  cond: { $eq: ["$$result.passed", true] },
                },
              },
            },
          },
          averageScore: {
            $avg: {
              $cond: {
                if: { $eq: [{ $size: "$results" }, 0] },
                then: 0,
                else: { $avg: "$results.score" },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          totalAttempts: 1,
          averageScore: 1,
          passRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $divide: ["$passedAttempts", "$totalAttempts"] },
            ],
          },
        },
      },
    ]);

    // 4. Statistiques des catégories
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courses",
          foreignField: "_id",
          as: "coursesData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1, // Assurez-vous que le nom est projeté
          coursesCount: { $size: "$coursesData" },
          enrollmentsCount: {
            $reduce: {
              input: "$coursesData",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $size: {
                      $ifNull: ["$$this.studentsEnrolled", []],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    // 5. Statistiques des certificats
    const certificateStats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
        },
      },
    ]);
    const statistics = await Statistics.create({
      totalUsers: {
        students: userStats.find((stat) => stat._id === "Student")?.count || 0,
        instructors:
          userStats.find((stat) => stat._id === "Instructor")?.count || 0,
        admins: userStats.find((stat) => stat._id === "Admin")?.count || 0,
      },
      coursesStats: {
        totalCourses:
          courseStats[0]?.statusStats?.reduce(
            (acc, curr) => acc + curr.count,
            0
          ) || 0,
        publishedCourses:
          courseStats[0]?.statusStats?.find((stat) => stat._id === "Published")
            ?.count || 0,
        draftCourses:
          courseStats[0]?.statusStats?.find((stat) => stat._id === "Draft")
            ?.count || 0,
        totalEnrollments:
          courseStats[0]?.enrollmentStats?.[0]?.totalEnrollments || 0,
        certifiedCourses:
          courseStats[0]?.enrollmentStats?.[0]?.certifiedCourses || 0, // Ajout ici
      },
      quizStats: {
        totalQuizzes: quizStats[0]?.totalQuizzes || 0,
        totalAttempts: quizStats[0]?.totalAttempts || 0,
        averageScore: quizStats[0]?.averageScore || 0,
        passRate: quizStats[0]?.passRate || 0,
      },
      certificatesIssued: certificateStats[0]?.totalCertificates || 0,
      categoryStats: categoryStats.map((cat) => ({
        category: {
          _id: cat._id,
          name: cat.name, // Ajouter le nom ici
        },
        coursesCount: cat.coursesCount || 0,
        enrollmentsCount: cat.enrollmentsCount || 0,
      })),
      dailyActiveUsers: userStats.reduce(
        (acc, curr) => acc + (curr.activeUsers || 0),
        0
      ),
      monthlyActiveUsers: userStats.reduce(
        (acc, curr) => acc + (curr.count || 0),
        0
      ),
      revenueStats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
      },
    });

    return statistics;
  } catch (error) {
    console.error("Erreur lors de la génération des statistiques:", error);
    return null;
  }
};

// Récupérer l'historique des statistiques
exports.getStatisticsHistory = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const query = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée actuelle

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Par défaut, rechercher les statistiques des 30 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Récupérer les statistiques historiques
    let statistics = await Statistics.find(query)
      .populate({
        path: "categoryStats.category",
        model: "Category",
        select: "name",
      })
      .sort({ date: -1 });

    // Vérifier s'il y a des statistiques pour aujourd'hui
    const todayStats = statistics.find((stat) => {
      const statDate = new Date(stat.date);
      return (
        statDate.getDate() === today.getDate() &&
        statDate.getMonth() === today.getMonth() &&
        statDate.getFullYear() === today.getFullYear()
      );
    });

    // Si aucune statistique pour aujourd'hui, générer de nouvelles statistiques
    if (!todayStats) {
      const newStats = await this.generateNewStatistics();

      if (newStats) {
        // Ajouter les nouvelles statistiques au début du tableau (les plus récentes)
        statistics = [newStats, ...statistics];
      }
    } else {
      // Mettre à jour les statistiques d'aujourd'hui avec les données les plus récentes

      const updatedStats = await this.generateNewStatistics();

      if (updatedStats) {
        // Remplacer les statistiques d'aujourd'hui par les nouvelles
        statistics = statistics.map((stat) => {
          const statDate = new Date(stat.date);
          if (
            statDate.getDate() === today.getDate() &&
            statDate.getMonth() === today.getMonth() &&
            statDate.getFullYear() === today.getFullYear()
          ) {
            return updatedStats;
          }
          return stat;
        });
      }
    }

    if (statistics.length === 0) {
      // Si toujours aucune statistique n'est trouvée, générer de nouvelles statistiques
      const newStats = await this.generateNewStatistics();

      if (newStats) {
        return res.status(200).json({
          success: true,
          data: [newStats],
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Erreur getStatisticsHistory:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique",
      error: error.message,
    });
  }
};

// Dans statisticsController.js - getQuizStatistics

exports.getQuizStatistics = async (req, res) => {
  try {
    const quizStats = await Quiz.aggregate([
      {
        $lookup: {
          from: "quizresults",
          localField: "_id",
          foreignField: "quiz",
          as: "results",
        },
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: { $size: "$results" } },
          passedAttempts: {
            $sum: {
              $size: {
                $filter: {
                  input: "$results",
                  as: "result",
                  cond: { $eq: ["$$result.passed", true] },
                },
              },
            },
          },
          averageScore: {
            $avg: {
              $cond: {
                if: { $eq: [{ $size: "$results" }, 0] },
                then: 0,
                else: { $avg: "$results.score" },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          totalAttempts: 1,
          averageScore: 1,
          passRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $divide: ["$passedAttempts", "$totalAttempts"] },
            ],
          },
        },
      },
    ]);

    const stats = quizStats[0] || {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques des quiz:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques des quiz",
      error: error.message,
    });
  }
};

// Statistiques de progression des cours
exports.getCourseProgressStatistics = async (req, res) => {
  try {
    console.log("Début du calcul des statistiques de progression");

    // Récupérer tous les cours publiés AVEC leurs sections
    const courses = await Course.find({ status: "Published" }).populate(
      "courseContent"
    ); // Populate les sections ici

    const progressData = [];

    for (const course of courses) {
      // Les sections sont maintenant disponibles directement
      const sections = course.courseContent || [];

      if (sections.length === 0) {
        continue;
      }

      // Récupérer toutes les sous-sections pour ces sections
      const sectionIds = sections.map((section) => section._id);

      // Récupérer toutes les sections avec leurs sous-sections
      const sectionsWithSubsections = await Section.find({
        _id: { $in: sectionIds },
      }).populate("subSection");

      // Extraire toutes les sous-sections
      let allSubsections = [];
      sectionsWithSubsections.forEach((section) => {
        if (section.subSection && Array.isArray(section.subSection)) {
          allSubsections = [...allSubsections, ...section.subSection];
        }
      });

      if (allSubsections.length === 0) {
        continue;
      }

      // Récupérer les progressions des étudiants
      const studentProgressions = await CourseProgress.find({
        courseID: course._id,
      });

      if (studentProgressions.length === 0) {
        continue;
      }

      // Calculer la progression pour chaque étudiant
      let totalCompletionPercentage = 0;
      let totalCompletedStudents = 0;

      for (const progression of studentProgressions) {
        const completedVideosIds = progression.completedVideos.map((id) =>
          id.toString()
        );
        const subsectionIds = allSubsections.map((sub) => sub._id.toString());

        // Compter combien de sous-sections ont été complétées
        let completedCount = 0;
        completedVideosIds.forEach((videoId) => {
          if (subsectionIds.includes(videoId)) {
            completedCount++;
          }
        });

        // Calculer le pourcentage
        const studentPercentage =
          (completedCount / allSubsections.length) * 100;

        totalCompletionPercentage += studentPercentage;

        if (completedCount === allSubsections.length) {
          totalCompletedStudents++;
        }
      }

      // Calculer la moyenne
      const averageCompletion =
        totalCompletionPercentage / studentProgressions.length;

      // Ajouter aux résultats
      progressData.push({
        _id: course._id,
        name: course.courseName,
        averageCompletion: averageCompletion,
        totalStudents: studentProgressions.length,
        totalCompleted: totalCompletedStudents,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courses: progressData,
        averageTotalCompletion:
          progressData.length > 0
            ? progressData.reduce(
                (sum, course) => sum + course.averageCompletion,
                0
              ) / progressData.length
            : 0,
      },
    });
  } catch (error) {
    console.error("Erreur lors du calcul des stats de progression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de progression",
      error: error.message,
    });
  }
};

// Statistiques des évaluations
exports.getRatingStatistics = async (req, res) => {
  try {
    const ratingsDistribution = await RatingAndReview.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const courseRatings = await RatingAndReview.aggregate([
      {
        $group: {
          _id: "$course",
          averageRating: { $avg: { $toDouble: "$rating" } },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: { path: "$courseInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          courseName: "$courseInfo.courseName",
          averageRating: 1,
          totalReviews: 1,
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    // Récupérer toutes les évaluations pour le frontend
    const ratings = await RatingAndReview.find()
      .populate("user", "firstName lastName")
      .populate("course", "courseName")
      .select("rating review createdAt")
      .sort("-createdAt")
      .limit(100);

    res.status(200).json({
      success: true,
      data: {
        distribution: ratingsDistribution || [],
        courseRatings: courseRatings || [],
        ratings: ratings || [],
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques d'évaluation:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques d'évaluation",
      error: error.message,
    });
  }
};
