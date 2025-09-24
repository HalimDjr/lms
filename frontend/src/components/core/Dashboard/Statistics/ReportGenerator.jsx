// frontend/src/components/core/Dashboard/Statistics/ReportGenerator.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiFileText,
  FiPieChart,
  FiUsers,
  FiBook,
  FiBarChart2,
} from "react-icons/fi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  exportStatisticsToCSV,
  generatePDFReport,
} from "../../../../services/operations/statisticsAPI";

const ReportGenerator = ({
  statistics,
  historicalData,
  onReportTypeChange,
  selectedReportType = "complete",
}) => {
  const { darkMode } = useSelector((state) => state.theme);
  const [isGenerating, setIsGenerating] = useState(false);

  // Types de rapports disponibles
  const reportTypes = [
    {
      id: "users",
      name: "Utilisateurs",
      icon: <FiUsers />,
      description: "Rapport détaillé sur les utilisateurs de la plateforme",
    },
    {
      id: "courses",
      name: "formations",
      icon: <FiBook />,
      description: "Analyse des formations et des inscriptions",
    },
    {
      id: "categories",
      name: "Catégories",
      icon: <FiPieChart />,
      description: "Distribution des formations par catégorie",
    },
    {
      id: "quiz",
      name: "Examens & Évaluations",
      icon: <FiBarChart2 />,
      description: "Statistiques des examens et évaluations",
    },
    {
      id: "complete",
      name: "Rapport complet",
      icon: <FiFileText />,
      description: "Rapport complet avec toutes les statistiques",
    },
  ];

  // Générer un rapport
  const handleGenerateReport = async (format = "csv") => {
    if (!statistics) return;

    setIsGenerating(true);

    try {
      if (format === "csv") {
        await exportStatisticsToCSV(statistics, selectedReportType);
      } else if (format === "pdf") {
        await generatePDFReport(statistics, selectedReportType);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Gérer le changement de type de rapport
  const handleReportTypeChange = (reportType) => {
    if (onReportTypeChange) {
      onReportTypeChange(reportType);
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800" : "bg-white"
      } rounded-xl shadow-md p-6`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          darkMode ? "text-white" : "text-richblack-800"
        }`}
      >
        Générateur de rapports
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {reportTypes.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleReportTypeChange(report.id)}
            className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${
              selectedReportType === report.id
                ? darkMode
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-blue-500 bg-blue-50"
                : darkMode
                ? "border-richblack-700 hover:border-richblack-600"
                : "border-richblack-100 hover:border-richblack-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`text-xl ${
                  selectedReportType === report.id
                    ? "text-blue-500"
                    : darkMode
                    ? "text-richblack-300"
                    : "text-richblack-600"
                }`}
              >
                {report.icon}
              </div>
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-richblack-800"
                  }`}
                >
                  {report.name}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  {report.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div
          className={`text-sm ${
            darkMode ? "text-richblack-300" : "text-richblack-600"
          }`}
        >
          {getReportDescription(selectedReportType)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateReport("csv")}
            disabled={isGenerating || !statistics}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isGenerating || !statistics ? "opacity-50 cursor-not-allowed" : ""
            } ${
              darkMode
                ? "bg-richblack-700 hover:bg-richblack-600 text-white"
                : "bg-richblack-50 hover:bg-richblack-100 text-richblack-800"
            } transition-colors`}
          >
            <FiDownload />
            <span>CSV</span>
          </button>

          <button
            onClick={() => handleGenerateReport("pdf")}
            disabled={isGenerating || !statistics}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isGenerating || !statistics ? "opacity-50 cursor-not-allowed" : ""
            } ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } transition-colors`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FiFileText />
                <span>PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction pour obtenir la description du rapport
const getReportDescription = (reportType) => {
  switch (reportType) {
    case "users":
      return "Ce rapport inclut des statistiques détaillées sur les utilisateurs, leur répartition par type et leur activité.";
    case "courses":
      return "Ce rapport fournit des informations sur les formations, leur statut, les inscriptions et les taux de complétion.";
    case "categories":
      return "Ce rapport analyse la distribution des formations par catégorie et leur popularité.";
    case "quiz":
      return "Ce rapport présente les statistiques des examens, les scores moyens et les taux de réussite.";
    case "complete":
      return "Ce rapport complet inclut toutes les statistiques disponibles sur la plateforme.";
    default:
      return "";
  }
};

export default ReportGenerator;
