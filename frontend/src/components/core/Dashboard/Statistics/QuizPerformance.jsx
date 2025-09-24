import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const QuizPerformance = ({ quizStats, historicalData, darkMode }) => {
  // Ajouter un log pour déboguer les valeurs reçues
  useEffect(() => {}, [quizStats]);

  // Calculer les pourcentages
  const averageScoreValue = quizStats.averageScore || 0;
  const passRateValue = Number(quizStats.passRate) || 0;
  // Log des valeurs calculées
  useEffect(() => {
    console.log("Valeurs calculées:", {
      averageScore: averageScoreValue,
      passRate: passRateValue,
      passRatePercentage: passRateValue * 100,
    });
  }, [averageScoreValue, passRateValue]);
  // Configurer les options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
        },
      },
      title: {
        display: true,
        text: "Performance des examens",
        color: darkMode ? "#D1D5DB" : "#1F2937",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;

            if (context.datasetIndex === 0) {
              return `${label}: ${value}`;
            } else {
              return `${label}: ${value ? value.toFixed(1) : 0}%`;
            }
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
          callback: function (value) {
            return value;
          },
        },
      },
      y1: {
        beginAtZero: true,
        max: 100,
        position: "right",
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          callback: function (value) {
            return value + "%";
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
        },
      },
    },
  };

  // Préparer les données pour le graphique
  const data = {
    labels: ["examens", "Tentatives", "Score moyen", "Taux de réussite"],
    datasets: [
      {
        label: "Nombre",
        data: [
          quizStats.totalQuizzes || 0,
          quizStats.totalAttempts || 0,
          null,
          null,
        ],
        backgroundColor: [
          "rgba(139, 92, 246, 0.7)", // purple-500
          "rgba(245, 158, 11, 0.7)", // amber-500
        ],
        borderColor: [
          "rgba(139, 92, 246, 1)", // purple-500
          "rgba(245, 158, 11, 1)", // amber-500
        ],
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Pourcentage",
        data: [
          null,
          null,
          averageScoreValue, // Utiliser la valeur calculée
          passRateValue * 100, // Utiliser la valeur calculée
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)", // green-500
          "rgba(59, 130, 246, 0.7)", // blue-500
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)", // green-500
          "rgba(59, 130, 246, 1)", // blue-500
        ],
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800" : "bg-white"
      } rounded-xl shadow-md p-6`}
    >
      <div className="h-80">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default QuizPerformance;
