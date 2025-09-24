import React, { useMemo, useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnrollmentTrend = ({ historicalData, darkMode }) => {
  const [viewMode, setViewMode] = useState("enrollments"); // "enrollments", "courses", "users", "certificates", "all"

  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      console.log(
        "Données historiques brutes:",
        historicalData.map((item) => ({
          date: new Date(item.date).toISOString(),
          enrollments: item.coursesStats.totalEnrollments,
        }))
      );
    }
  }, [historicalData]);
  // Préparer les données pour le graphique, avec regroupement par jour
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return null;

    // Étape 1 : Filtrer les données invalides et créer des copies pour ne pas modifier l'original
    const validData = [...historicalData]
      .filter((item) => isValid(new Date(item.date)))
      // Trier par date, du plus ancien au plus récent
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(
      "Données triées:",
      validData.map((item) => ({
        date: new Date(item.date).toISOString(),
        enrollments: item.coursesStats.totalEnrollments,
      }))
    );
    // Étape 2 : Regrouper par jour
    const dailyData = validData.reduce((acc, item) => {
      const dateKey = format(new Date(item.date), "yyyy-MM-dd");

      // Ne mettre à jour que si nous n'avons pas déjà cette date
      // ou si c'est une entrée plus récente pour cette date
      if (!acc[dateKey] || new Date(item.date) > new Date(acc[dateKey].date)) {
        acc[dateKey] = {
          date: item.date,
          formattedDate: format(new Date(item.date), "dd MMM", { locale: fr }),
          totalEnrollments: item.coursesStats.totalEnrollments || 0,
          totalCourses: item.coursesStats.totalCourses || 0,
          totalUsers:
            (item.totalUsers.students || 0) +
            (item.totalUsers.instructors || 0) +
            (item.totalUsers.admins || 0),
          certificatesIssued: item.certificatesIssued || 0,
        };
      }
      return acc;
    }, {});

    // Étape 3 : Convertir en tableau et trier par date
    const groupedData = Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Log de vérification
    console.log(
      "Données finales groupées:",
      groupedData.map((item) => ({
        date: format(new Date(item.date), "yyyy-MM-dd"),
        enrollments: item.totalEnrollments,
      }))
    );

    // Étape 4 : Créer les données du graphique
    return {
      // Utiliser les dates formatées comme labels
      labels: groupedData.map((item) => item.formattedDate),
      datasets: [
        viewMode === "enrollments" || viewMode === "all"
          ? {
              label: "Inscriptions",
              data: groupedData.map((item) => item.totalEnrollments),
              borderColor: "rgba(59, 130, 246, 1)", // blue-500
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.3,
              fill: true,
            }
          : null,
        viewMode === "courses" || viewMode === "all"
          ? {
              label: "Formations",
              data: groupedData.map((item) => item.totalCourses),
              borderColor: "rgba(16, 185, 129, 1)", // green-500
              backgroundColor: "transparent",
              tension: 0.3,
            }
          : null,
        viewMode === "users" || viewMode === "all"
          ? {
              label: "Utilisateurs",
              data: groupedData.map((item) => item.totalUsers),
              borderColor: "rgba(139, 92, 246, 1)", // purple-500
              backgroundColor: "transparent",
              tension: 0.3,
            }
          : null,
        viewMode === "certificates" || viewMode === "all"
          ? {
              label: "Certificats",
              data: groupedData.map((item) => item.certificatesIssued),
              borderColor: "rgba(245, 158, 11, 1)", // amber-500
              backgroundColor: "transparent",
              tension: 0.3,
            }
          : null,
      ].filter(Boolean), // Filtrer les éléments null
    };
  }, [historicalData, viewMode]);

  // Configurer les options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: getTrendTitle(viewMode),
        color: darkMode ? "#D1D5DB" : "#1F2937",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: darkMode
          ? "rgba(30, 41, 59, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: darkMode ? "#D1D5DB" : "#1F2937",
        bodyColor: darkMode ? "#D1D5DB" : "#1F2937",
        borderColor: darkMode
          ? "rgba(148, 163, 184, 0.2)"
          : "rgba(203, 213, 225, 0.8)",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          // Afficher les valeurs avec formatage approprié
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }

            const value = context.parsed.y;

            if (viewMode === "enrollments" || label.includes("Inscriptions")) {
              return label + value + " inscriptions";
            } else if (viewMode === "courses" || label.includes("Cours")) {
              return label + value + " cours";
            } else if (viewMode === "users" || label.includes("Utilisateurs")) {
              return label + value + " utilisateurs";
            } else if (
              viewMode === "certificates" ||
              label.includes("Certificats")
            ) {
              return label + value + " certificats";
            }

            return label + value;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          precision: 0, // Entiers uniquement, pas de décimales
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  };

  // Obtenir le titre en fonction du mode de vue
  function getTrendTitle(mode) {
    switch (mode) {
      case "enrollments":
        return "Évolution des inscriptions";
      case "courses":
        return "Évolution des formations";
      case "users":
        return "Évolution des utilisateurs";
      case "certificates":
        return "Évolution des certificats délivrés";
      case "all":
        return "Évolution globale";
      default:
        return "Tendances";
    }
  }

  // Détecter si nous avons suffisamment de données
  const hasSufficientData =
    historicalData &&
    historicalData.length > 1 &&
    chartData &&
    chartData.labels &&
    chartData.labels.length > 1;

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800" : "bg-white"
      } rounded-xl shadow-md p-6`}
    >
      {/* Options de visualisation */}
      <div className="flex justify-end mb-4">
        <div
          className={`inline-flex rounded-md ${
            darkMode ? "bg-richblack-700" : "bg-richblack-50"
          }`}
        >
          <button
            onClick={() => setViewMode("enrollments")}
            className={`px-3 py-1 text-xs ${
              viewMode === "enrollments"
                ? darkMode
                  ? "bg-blue-600 text-white rounded-l-md"
                  : "bg-blue-500 text-white rounded-l-md"
                : darkMode
                ? "text-richblack-300 rounded-l-md"
                : "text-richblack-600 rounded-l-md"
            }`}
          >
            Inscriptions
          </button>
          <button
            onClick={() => setViewMode("courses")}
            className={`px-3 py-1 text-xs ${
              viewMode === "courses"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Formations
          </button>
          <button
            onClick={() => setViewMode("users")}
            className={`px-3 py-1 text-xs ${
              viewMode === "users"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setViewMode("certificates")}
            className={`px-3 py-1 text-xs ${
              viewMode === "certificates"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Certificats
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-3 py-1 text-xs ${
              viewMode === "all"
                ? darkMode
                  ? "bg-blue-600 text-white rounded-r-md"
                  : "bg-blue-500 text-white rounded-r-md"
                : darkMode
                ? "text-richblack-300 rounded-r-md"
                : "text-richblack-600 rounded-r-md"
            }`}
          >
            Tout
          </button>
        </div>
      </div>

      <div className="h-80">
        {hasSufficientData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p
              className={`text-center ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Pas assez de données pour afficher la tendance.
              <br />
              Générez des statistiques sur plusieurs jours pour voir
              l'évolution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentTrend;
