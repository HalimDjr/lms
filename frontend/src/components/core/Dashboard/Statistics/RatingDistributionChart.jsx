import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const RatingDistributionChart = ({ ratingStats, darkMode }) => {
  // Vérifier si ratingStats existe et contient des données
  if (
    !ratingStats ||
    !ratingStats.distribution ||
    !Array.isArray(ratingStats.distribution) ||
    ratingStats.distribution.length === 0
  ) {
    return (
      <div
        className={`${
          darkMode ? "bg-richblack-800" : "bg-white"
        } rounded-xl shadow-md p-6`}
      >
        <div className="h-80 flex items-center justify-center">
          <p
            className={`text-center ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Aucune donnée d'évaluation disponible.
          </p>
        </div>
      </div>
    );
  }

  // Préparer les données pour le graphique à partir de la distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // Pour les notes de 1 à 5

  // Remplir avec les données de distribution
  ratingStats.distribution.forEach((item) => {
    const rating = parseInt(item._id);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = item.count;
    }
  });

  // Configurer les options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Distribution des évaluations",
        color: darkMode ? "#D1D5DB" : "#1F2937",
        font: { size: 16 },
      },
    },
    cutout: "50%",
  };

  // Préparer les données pour le graphique
  const data = {
    labels: ["1 étoile", "2 étoiles", "3 étoiles", "4 étoiles", "5 étoiles"],
    datasets: [
      {
        data: ratingCounts,
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)", // rouge - 1 étoile
          "rgba(245, 158, 11, 0.7)", // ambre - 2 étoiles
          "rgba(59, 130, 246, 0.7)", // bleu - 3 étoiles
          "rgba(16, 185, 129, 0.7)", // vert - 4 étoiles
          "rgba(139, 92, 246, 0.7)", // violet - 5 étoiles
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculer la note moyenne
  const totalRatings = ratingCounts.reduce(
    (sum, count, index) => sum + count * (index + 1),
    0
  );
  const totalCount = ratingCounts.reduce((sum, count) => sum + count, 0);
  const averageRating =
    totalCount > 0 ? (totalRatings / totalCount).toFixed(1) : "N/A";

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800" : "bg-white"
      } rounded-xl shadow-md p-6`}
    >
      {/* Graphique + Info principale - hauteur fixe */}
      <div className="h-80 flex flex-col">
        {/* Graphique */}
        <div className="flex-1 relative">
          <Doughnut options={options} data={data} />
        </div>

        {/* Note moyenne */}
        <div className="mt-4 text-center">
          <p
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Note moyenne
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}
            >
              {averageRating}
            </p>
            <div className="text-yellow-400 text-lg">★</div>
          </div>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-richblack-400" : "text-richblack-500"
            }`}
          >
            Basée sur {totalCount} évaluations
          </p>
        </div>
      </div>

      {/* Statistiques détaillées - hauteur auto 
      <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
        {ratingCounts.map((count, index) => {
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div
              key={index}
              className={`${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              <div className="font-medium">{5 - index} ★</div>
              <div className="mt-1">
                <div
                  className={`w-full h-1 rounded-full ${
                    darkMode ? "bg-richblack-700" : "bg-richblack-100"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-1">
                {count} ({percentage.toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>
*/}
      {/* Onglets pour afficher soit les dernières évaluations, soit les cours */}
      <div className="mt-6">
        <div className="flex justify-between">
          <h3
            className={`text-sm font-medium ${
              darkMode ? "text-richblack-200" : "text-richblack-700"
            }`}
          >
            Top 3 des formations les mieux notées
          </h3>
        </div>

        {/* Top cours */}
        {ratingStats.courseRatings && ratingStats.courseRatings.length > 0 ? (
          <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pb-1">
            {ratingStats.courseRatings.slice(0, 3).map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-opacity-10"
                style={{
                  backgroundColor:
                    index === 0
                      ? "rgba(245, 158, 11, 0.1)" // gold
                      : index === 1
                      ? "rgba(156, 163, 175, 0.1)" // silver
                      : "rgba(205, 127, 50, 0.1)", // bronze
                }}
              >
                <span
                  className={`truncate flex-1 font-medium ${
                    darkMode ? "text-richblack-100" : "text-richblack-700"
                  }`}
                >
                  {course.courseName || "Cours sans nom"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">
                    {parseFloat(course.averageRating).toFixed(1)} ★
                  </span>
                  <span
                    className={`${
                      darkMode ? "text-richblack-400" : "text-richblack-500"
                    }`}
                  >
                    ({course.totalReviews})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`text-xs italic mt-2 ${
              darkMode ? "text-richblack-400" : "text-richblack-500"
            }`}
          >
            Aucun cours évalué
          </p>
        )}
      </div>
    </div>
  );
};

export default RatingDistributionChart;
