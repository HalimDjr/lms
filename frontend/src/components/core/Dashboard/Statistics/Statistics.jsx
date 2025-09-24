import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaCertificate,
} from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ReportGenerator from "./ReportGenerator";
import {
  generateStatistics,
  getStatisticsHistory,
  getAllDashboardStats,
} from "../../../../services/operations/statisticsAPI";
import StatCard from "./StatCard";
import UsersChart from "./UsersChart";
import CoursesChart from "./CoursesChart";
import CategoryDistribution from "./CategoryDistribution";
import EnrollmentTrend from "./EnrollmentTrend";
import QuizPerformance from "./QuizPerformance";
import CourseProgressChart from "./CourseProgressChart";
import RatingDistributionChart from "./RatingDistributionChart";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

const Statistics = () => {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [statistics, setStatistics] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState("complete");

  // Charger toutes les statistiques
  const loadAllStats = async () => {
    setIsLoading(true);
    // 1. Essayer d'obtenir les statistiques complètes
    const allStats = await getAllDashboardStats(token);
    // 2. Si les statistiques existent, les utiliser
    if (allStats.general) {
      setStatistics(allStats.general);
      setHistoricalData(allStats.history);
      setQuizStats(allStats.quiz);
      setProgressStats(allStats.progress);
      setRatingStats(allStats.ratings);
      setLastUpdate(new Date());
      setIsLoading(false);
      return;
    }
    // 3. Sinon, tenter de générer de nouvelles statistiques
    const newStats = await generateStatistics(token);
    if (newStats) {
      setStatistics(newStats);
      // 4. Charger l'historique mis à jour
      loadHistoricalData();
      setLastUpdate(new Date());
    }
    setIsLoading(false);
  };

  // Fonction séparée pour charger uniquement l'historique
  const loadHistoricalData = async () => {
    // Utiliser des dates fixes pour simplifier (30 derniers jours)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    const historyData = await getStatisticsHistory(
      token,
      formattedStartDate,
      formattedEndDate
    );
    if (historyData && historyData.length > 0) {
      setHistoricalData(historyData);
    }
  };

  /**
   * Exporte les statistiques au format Excel bien structuré
   * @param {Object} statistics - Les données de statistiques à exporter
   * @param {string} reportType - Le type de rapport (users, courses, categories, complete)
   * @returns {Promise<boolean>} - Promise résolue avec true si l'export a réussi, false sinon
   */
  const exportStatisticsToExcel = async (
    statistics,
    reportType = "complete"
  ) => {
    try {
      if (!statistics) {
        return false;
      }

      // Créer un nouveau classeur Excel
      const workbook = new Workbook();

      // Ajouter des métadonnées
      workbook.creator = "EPBLearning";
      workbook.lastModifiedBy = "EPBLearning";
      workbook.created = new Date();
      workbook.modified = new Date();

      // Fonction utilitaire pour formater les en-têtes
      const formatHeader = (cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      };

      // Fonction utilitaire pour ajouter un titre
      const addTitle = (worksheet, title, row) => {
        const titleCell = worksheet.getCell(`A${row}`);
        titleCell.value = title;
        titleCell.font = { bold: true, size: 14 };
        worksheet.mergeCells(`A${row}:E${row}`);
        return row + 2; // Sauter une ligne après le titre
      };

      let worksheet;
      switch (reportType) {
        case "users":
          // Feuille pour les utilisateurs
          worksheet = workbook.addWorksheet("Utilisateurs");
          // Titre
          let row = addTitle(worksheet, "Statistiques des Utilisateurs", 1);
          // En-têtes
          worksheet.getRow(row).values = [
            "Type d'utilisateur",
            "Nombre",
            "Pourcentage",
          ];
          worksheet.getRow(row).eachCell(formatHeader);
          row++;
          // Données
          const totalUsers =
            statistics.totalUsers.students +
            statistics.totalUsers.instructors +
            statistics.totalUsers.admins;
          worksheet.getRow(row).values = [
            "Apprenants",
            statistics.totalUsers.students,
            `${((statistics.totalUsers.students / totalUsers) * 100).toFixed(
              2
            )}%`,
          ];
          row++;
          worksheet.getRow(row).values = [
            "Formateurs",
            statistics.totalUsers.instructors,
            `${((statistics.totalUsers.instructors / totalUsers) * 100).toFixed(
              2
            )}%`,
          ];
          row++;
          worksheet.getRow(row).values = [
            "Administrateurs",
            statistics.totalUsers.admins,
            `${((statistics.totalUsers.admins / totalUsers) * 100).toFixed(
              2
            )}%`,
          ];
          row += 2;
          // Activité
          row = addTitle(worksheet, "Activité des Utilisateurs", row);
          worksheet.getRow(row).values = ["Métrique", "Nombre"];
          worksheet.getRow(row).eachCell(formatHeader);
          row++;
          worksheet.getRow(row).values = [
            "Utilisateurs actifs (jour)",
            statistics.dailyActiveUsers,
          ];
          row++;
          worksheet.getRow(row).values = [
            "Utilisateurs actifs (mois)",
            statistics.monthlyActiveUsers,
          ];
          // Ajuster la largeur des colonnes
          worksheet.columns.forEach((column) => {
            column.width = 20;
          });
          break;

        case "courses":
          // Feuille pour les formations
          worksheet = workbook.addWorksheet("Formations");
          // Titre
          row = addTitle(worksheet, "Statistiques des Formations", 1);
          // En-têtes
          worksheet.getRow(row).values = ["Statut", "Nombre", "Pourcentage"];
          worksheet.getRow(row).eachCell(formatHeader);
          row++;
          // Données
          worksheet.getRow(row).values = [
            "Publiées",
            statistics.coursesStats.publishedCourses,
            `${(
              (statistics.coursesStats.publishedCourses /
                statistics.coursesStats.totalCourses) *
              100
            ).toFixed(2)}%`,
          ];
          row++;
          worksheet.getRow(row).values = [
            "Brouillons",
            statistics.coursesStats.draftCourses,
            `${(
              (statistics.coursesStats.draftCourses /
                statistics.coursesStats.totalCourses) *
              100
            ).toFixed(2)}%`,
          ];
          row += 2;
          // Inscriptions
          row = addTitle(worksheet, "Inscriptions", row);
          worksheet.getRow(row).values = ["Métrique", "Valeur"];
          worksheet.getRow(row).eachCell(formatHeader);
          row++;
          worksheet.getRow(row).values = [
            "Total des inscriptions",
            statistics.coursesStats.totalEnrollments,
          ];
          row++;
          worksheet.getRow(row).values = [
            "Moyenne d'inscriptions par formation",
            (
              statistics.coursesStats.totalEnrollments /
              statistics.coursesStats.totalCourses
            ).toFixed(2),
          ];
          // Ajuster la largeur des colonnes
          worksheet.columns.forEach((column) => {
            column.width = 25;
          });
          break;

        case "categories":
          // Feuille pour les catégories
          worksheet = workbook.addWorksheet("Catégories");
          // Titre
          row = addTitle(worksheet, "Statistiques par Catégorie", 1);
          // En-têtes
          worksheet.getRow(row).values = [
            "Catégorie",
            "Nombre de formations",
            "Inscriptions",
            "Moyenne d'inscriptions par formation",
          ];
          worksheet.getRow(row).eachCell(formatHeader);
          row++;
          // Données
          if (statistics.categoryStats && statistics.categoryStats.length > 0) {
            statistics.categoryStats.forEach((cat) => {
              if (cat.category && cat.category.name) {
                worksheet.getRow(row).values = [
                  cat.category.name,
                  cat.coursesCount,
                  cat.enrollmentsCount,
                  (cat.enrollmentsCount / (cat.coursesCount || 1)).toFixed(2),
                ];
                row++;
              }
            });
          } else {
            worksheet.getRow(row).values = [
              "Aucune donnée de catégorie disponible",
            ];
          }
          // Ajuster la largeur des colonnes
          worksheet.columns.forEach((column) => {
            column.width = 30;
          });
          break;

        case "complete":
        default:
          // Rapport complet avec plusieurs feuilles
          // 1. Feuille Résumé
          const summarySheet = workbook.addWorksheet("Résumé");
          row = addTitle(summarySheet, "Résumé des Statistiques", 1);
          summarySheet.getRow(row).values = ["Métrique", "Valeur"];
          summarySheet.getRow(row).eachCell(formatHeader);
          row++;
          summarySheet.getRow(row).values = [
            "Total des utilisateurs",
            statistics.totalUsers.students +
              statistics.totalUsers.instructors +
              statistics.totalUsers.admins,
          ];
          row++;
          summarySheet.getRow(row).values = [
            "Total des formations",
            statistics.coursesStats.totalCourses,
          ];
          row++;
          summarySheet.getRow(row).values = [
            "Total des inscriptions",
            statistics.coursesStats.totalEnrollments,
          ];
          row++;
          summarySheet.getRow(row).values = [
            "Total des quiz",
            statistics.quizStats.totalQuizzes,
          ];
          row++;
          summarySheet.getRow(row).values = [
            "Certificats émis",
            statistics.certificatesIssued,
          ];
          row += 2;
          // Date de génération
          summarySheet.getRow(row).values = [
            "Rapport généré le",
            new Date().toLocaleString("fr-FR"),
          ];
          // Ajuster la largeur des colonnes
          summarySheet.columns.forEach((column) => {
            column.width = 25;
          });

          // 2. Feuille Utilisateurs
          const usersSheet = workbook.addWorksheet("Utilisateurs");
          row = addTitle(usersSheet, "Statistiques des Utilisateurs", 1);
          usersSheet.getRow(row).values = ["Type", "Nombre", "Pourcentage"];
          usersSheet.getRow(row).eachCell(formatHeader);
          row++;
          const totalUsersComplete =
            statistics.totalUsers.students +
            statistics.totalUsers.instructors +
            statistics.totalUsers.admins;
          usersSheet.getRow(row).values = [
            "Apprenants",
            statistics.totalUsers.students,
            `${(
              (statistics.totalUsers.students / totalUsersComplete) *
              100
            ).toFixed(2)}%`,
          ];
          row++;
          usersSheet.getRow(row).values = [
            "Formateurs",
            statistics.totalUsers.instructors,
            `${(
              (statistics.totalUsers.instructors / totalUsersComplete) *
              100
            ).toFixed(2)}%`,
          ];
          row++;
          usersSheet.getRow(row).values = [
            "Administrateurs",
            statistics.totalUsers.admins,
            `${(
              (statistics.totalUsers.admins / totalUsersComplete) *
              100
            ).toFixed(2)}%`,
          ];
          row += 2;
          row = addTitle(usersSheet, "Activité des Utilisateurs", row);
          usersSheet.getRow(row).values = ["Métrique", "Nombre"];
          usersSheet.getRow(row).eachCell(formatHeader);
          row++;
          usersSheet.getRow(row).values = [
            "Utilisateurs actifs (jour)",
            statistics.dailyActiveUsers,
          ];
          row++;
          usersSheet.getRow(row).values = [
            "Utilisateurs actifs (mois)",
            statistics.monthlyActiveUsers,
          ];
          // Ajuster la largeur des colonnes
          usersSheet.columns.forEach((column) => {
            column.width = 20;
          });

          // 3. Feuille Formations
          const coursesSheet = workbook.addWorksheet("Formations");
          row = addTitle(coursesSheet, "Statistiques des Formations", 1);
          coursesSheet.getRow(row).values = ["Statut", "Nombre", "Pourcentage"];
          coursesSheet.getRow(row).eachCell(formatHeader);
          row++;
          coursesSheet.getRow(row).values = [
            "Total",
            statistics.coursesStats.totalCourses,
            "100%",
          ];
          row++;
          coursesSheet.getRow(row).values = [
            "Publiées",
            statistics.coursesStats.publishedCourses,
            `${(
              (statistics.coursesStats.publishedCourses /
                statistics.coursesStats.totalCourses) *
              100
            ).toFixed(2)}%`,
          ];
          row++;
          coursesSheet.getRow(row).values = [
            "Brouillons",
            statistics.coursesStats.draftCourses,
            `${(
              (statistics.coursesStats.draftCourses /
                statistics.coursesStats.totalCourses) *
              100
            ).toFixed(2)}%`,
          ];
          row += 2;
          row = addTitle(coursesSheet, "Inscriptions", row);
          coursesSheet.getRow(row).values = ["Métrique", "Valeur"];
          coursesSheet.getRow(row).eachCell(formatHeader);
          row++;
          coursesSheet.getRow(row).values = [
            "Total des inscriptions",
            statistics.coursesStats.totalEnrollments,
          ];
          row++;
          coursesSheet.getRow(row).values = [
            "Moyenne d'inscriptions par formation",
            (
              statistics.coursesStats.totalEnrollments /
              statistics.coursesStats.totalCourses
            ).toFixed(2),
          ];
          // Ajuster la largeur des colonnes
          coursesSheet.columns.forEach((column) => {
            column.width = 25;
          });

          // 4. Feuille Quiz
          const quizSheet = workbook.addWorksheet("Quiz");
          row = addTitle(quizSheet, "Statistiques des Examens", 1);
          quizSheet.getRow(row).values = ["Métrique", "Valeur"];
          quizSheet.getRow(row).eachCell(formatHeader);
          row++;
          quizSheet.getRow(row).values = [
            "Total des examens",
            statistics.quizStats.totalQuizzes,
          ];
          row++;
          quizSheet.getRow(row).values = [
            "Total des tentatives",
            statistics.quizStats.totalAttempts,
          ];
          row++;
          quizSheet.getRow(row).values = [
            "Score moyen",
            `${(statistics.quizStats.averageScore * 100).toFixed(2)}%`,
          ];
          // Ajuster la largeur des colonnes
          quizSheet.columns.forEach((column) => {
            column.width = 25;
          });

          // 5. Feuille Catégories
          const categoriesSheet = workbook.addWorksheet("Catégories");
          row = addTitle(categoriesSheet, "Statistiques par Catégorie", 1);
          categoriesSheet.getRow(row).values = [
            "Catégorie",
            "Nombre de formations",
            "Inscriptions",
            "Moyenne d'inscriptions par formation",
          ];
          categoriesSheet.getRow(row).eachCell(formatHeader);
          row++;
          if (statistics.categoryStats && statistics.categoryStats.length > 0) {
            statistics.categoryStats.forEach((cat) => {
              if (cat.category && cat.category.name) {
                categoriesSheet.getRow(row).values = [
                  cat.category.name,
                  cat.coursesCount,
                  cat.enrollmentsCount,
                  (cat.enrollmentsCount / (cat.coursesCount || 1)).toFixed(2),
                ];
                row++;
              }
            });
          } else {
            categoriesSheet.getRow(row).values = [
              "Aucune donnée de catégorie disponible",
            ];
          }
          // Ajuster la largeur des colonnes
          categoriesSheet.columns.forEach((column) => {
            column.width = 30;
          });

          // 6. Feuille Certificats
          const certificatesSheet = workbook.addWorksheet("Certificats");
          row = addTitle(certificatesSheet, "Statistiques des Certificats", 1);
          certificatesSheet.getRow(row).values = ["Métrique", "Valeur"];
          certificatesSheet.getRow(row).eachCell(formatHeader);
          row++;
          certificatesSheet.getRow(row).values = [
            "Certificats émis",
            statistics.certificatesIssued,
          ];
          // Ajuster la largeur des colonnes
          certificatesSheet.columns.forEach((column) => {
            column.width = 25;
          });
          break;
      }

      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `rapport_${reportType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
      toast.success("Rapport Excel généré avec succès");
      return true;
    } catch (error) {
      console.error("EXPORT_EXCEL_ERROR", error);
      toast.error("Erreur lors de l'exportation des statistiques");
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Exporter les données en Excel
  const exportToExcel = () => {
    if (!statistics) return;
    // Utiliser la nouvelle fonction d'exportation Excel
    exportStatisticsToExcel(statistics, selectedReportType);
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    loadAllStats();
    // Configurer une actualisation automatique toutes les 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      loadAllStats();
    }, 300000);
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full mt-7">
      {isLoading && !statistics ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !statistics ? (
        <div
          className={`text-center py-12 ${
            darkMode ? "text-richblack-300" : "text-richblack-600"
          }`}
        >
          <p className="text-lg">Chargement des statistiques en cours...</p>
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Apprenants"
              value={statistics.totalUsers.students}
              icon={<FaUserGraduate />}
              color="blue"
              darkMode={darkMode}
            />
            <StatCard
              title="Formateurs"
              value={statistics.totalUsers.instructors}
              icon={<FaChalkboardTeacher />}
              color="green"
              darkMode={darkMode}
            />
            <StatCard
              title="Formations"
              value={statistics.coursesStats.totalCourses}
              icon={<FaBook />}
              color="purple"
              darkMode={darkMode}
            />
            <StatCard
              title="Certificats émis"
              value={statistics.certificatesIssued}
              icon={<FaCertificate />}
              color="yellow"
              darkMode={darkMode}
            />
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UsersChart
              userData={statistics.totalUsers}
              activeUsers={{
                daily: statistics.dailyActiveUsers,
                monthly: statistics.monthlyActiveUsers,
              }}
              historicalData={historicalData}
              darkMode={darkMode}
            />
            <CoursesChart
              courseData={statistics.coursesStats}
              historicalData={historicalData}
              darkMode={darkMode}
            />
          </div>

          {/* Graphiques secondaires */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CategoryDistribution
              categoryStats={statistics.categoryStats}
              darkMode={darkMode}
            />
            <QuizPerformance
              quizStats={statistics.quizStats}
              historicalData={historicalData}
              darkMode={darkMode}
            />
          </div>

          {/* Graphiques supplémentaires */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {progressStats && (
              <CourseProgressChart
                progressStats={progressStats}
                darkMode={darkMode}
              />
            )}
            {ratingStats && (
              <RatingDistributionChart
                ratingStats={ratingStats}
                darkMode={darkMode}
              />
            )}
          </div>

          {/* Tendance des inscriptions */}
          <div className="mb-8">
            <EnrollmentTrend
              historicalData={historicalData}
              darkMode={darkMode}
            />
          </div>

          <div className="mb-8">
            <ReportGenerator
              statistics={statistics}
              historicalData={historicalData}
              onReportTypeChange={setSelectedReportType}
              selectedReportType={selectedReportType}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
