import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const CoursesChart = ({ courseData, historicalData, darkMode }) => {
  // Calculer le nombre de cours certifiés
  const certifiedCourses = courseData.certifiedCourses || 0;

  // Configurer les options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Statut des formations",
        color: darkMode ? "#D1D5DB" : "#1F2937",
        font: {
          size: 16,
        },
      },
    },
    cutout: "60%",
  };

  // Préparer les données pour le graphique
  const data = {
    labels: ["Publiés", "Brouillons"],
    datasets: [
      {
        data: [
          courseData.publishedCourses,
          courseData.draftCourses,
          certifiedCourses,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)", // green-500 - publiés
          "rgba(245, 158, 11, 0.7)", // amber-500 - brouillons
          "rgba(59, 130, 246, 0.7)", // blue-500 - certifiés
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)", // green-500
          "rgba(245, 158, 11, 1)", // amber-500
          "rgba(59, 130, 246, 1)", // blue-500
        ],
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
      <div className="flex flex-col h-80">
        <div className="flex-1 relative">
          <Doughnut options={options} data={data} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Total des formations
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              {courseData.totalCourses}
            </p>
          </div>
          <div className="text-center">
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Inscriptions
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              {courseData.totalEnrollments}
            </p>
          </div>

          <div className="text-center">
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Moy. inscriptions
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              {courseData.totalCourses > 0
                ? (
                    courseData.totalEnrollments / courseData.totalCourses
                  ).toFixed(1)
                : "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesChart;
