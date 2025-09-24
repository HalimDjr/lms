// frontend/src/components/core/Dashboard/Statistics/CategoryDistribution.jsx
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDistribution = ({ categoryStats = [], darkMode }) => {
  const [displayMode, setDisplayMode] = useState("courses"); // "courses" ou "enrollments"

  // Ajouter un log pour déboguer
  useEffect(() => {}, [categoryStats]);

  // Générer des couleurs pour chaque catégorie
  const generateColors = (count) => {
    const colors = [
      "rgba(59, 130, 246, 0.7)", // blue-500
      "rgba(16, 185, 129, 0.7)", // green-500
      "rgba(139, 92, 246, 0.7)", // purple-500
      "rgba(245, 158, 11, 0.7)", // amber-500
      "rgba(236, 72, 153, 0.7)", // pink-500
      "rgba(239, 68, 68, 0.7)", // red-500
      "rgba(14, 165, 233, 0.7)", // sky-500
      "rgba(168, 85, 247, 0.7)", // purple-500
      "rgba(234, 88, 12, 0.7)", // orange-500
      "rgba(20, 184, 166, 0.7)", // teal-500
    ];

    // Si nous avons plus de catégories que de couleurs, répéter les couleurs
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }

    return result;
  };

  // Configurer les options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          font: {
            size: 11,
          },
          boxWidth: 15,
          padding: 10,
        },
      },
      title: {
        display: true,
        text:
          displayMode === "courses"
            ? "Distribution des formations par catégorie"
            : "Distribution des inscriptions par catégorie",
        color: darkMode ? "#D1D5DB" : "#1F2937",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Vérifier que categoryStats existe et contient des données
  if (
    !categoryStats ||
    !Array.isArray(categoryStats) ||
    categoryStats.length === 0
  ) {
    return (
      <div
        className={`${
          darkMode ? "bg-richblack-800" : "bg-white"
        } rounded-xl shadow-md p-6`}
      >
        <div className="flex justify-end mb-4">
          <div
            className={`inline-flex rounded-md ${
              darkMode ? "bg-richblack-700" : "bg-richblack-50"
            }`}
          >
            <button
              onClick={() => setDisplayMode("courses")}
              className={`px-3 py-1 text-xs rounded-l-md ${
                displayMode === "courses"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "text-richblack-300"
                  : "text-richblack-600"
              }`}
            >
              formations
            </button>
            <button
              onClick={() => setDisplayMode("enrollments")}
              className={`px-3 py-1 text-xs rounded-r-md ${
                displayMode === "enrollments"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "text-richblack-300"
                  : "text-richblack-600"
              }`}
            >
              Inscriptions
            </button>
          </div>
        </div>

        <div className="h-72 flex items-center justify-center">
          <p
            className={`text-center ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Aucune donnée de catégorie disponible.
          </p>
        </div>
      </div>
    );
  }

  // Filtrer les catégories valides et extraire le nom correctement
  const validCategories = categoryStats.filter((cat) => {
    // Log pour déboguer chaque catégorie
    console.log("Catégorie:", cat);

    // Vérifier si la catégorie a un nom, soit directement, soit via l'objet category
    const hasName =
      (cat && cat.name) ||
      (cat && cat.category && cat.category.name) ||
      (cat &&
        cat.category &&
        typeof cat.category === "object" &&
        cat.category.name);

    return hasName;
  });

  console.log("Catégories valides:", validCategories);

  // Fonction pour obtenir le nom de la catégorie, quelle que soit sa structure
  const getCategoryName = (cat) => {
    if (cat.name) return cat.name;
    if (cat.category && typeof cat.category === "string") return cat.category;
    if (cat.category && cat.category.name) return cat.category.name;
    return "Sans nom";
  };

  // Préparer les données pour le graphique
  const data = {
    labels: validCategories.map((cat) => {
      // Limiter la longueur du nom pour l'affichage
      const name = getCategoryName(cat);
      return name.length > 20 ? name.substring(0, 20) + "..." : name;
    }),
    datasets: [
      {
        data: validCategories.map((cat) =>
          displayMode === "courses" ? cat.coursesCount : cat.enrollmentsCount
        ),
        backgroundColor: generateColors(validCategories.length),
        borderColor: generateColors(validCategories.length).map((color) =>
          color.replace("0.7", "1")
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800" : "bg-white"
      } rounded-xl shadow-md p-6`}
    >
      <div className="flex justify-end mb-4">
        <div
          className={`inline-flex rounded-md ${
            darkMode ? "bg-richblack-700" : "bg-richblack-50"
          }`}
        >
          <button
            onClick={() => setDisplayMode("courses")}
            className={`px-3 py-1 text-xs rounded-l-md ${
              displayMode === "courses"
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
            onClick={() => setDisplayMode("enrollments")}
            className={`px-3 py-1 text-xs rounded-r-md ${
              displayMode === "enrollments"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Inscriptions
          </button>
        </div>
      </div>

      <div className="h-72">
        {validCategories.length > 0 ? (
          <Pie options={options} data={data} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p
              className={`text-center ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Aucune donnée de catégorie disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDistribution;
