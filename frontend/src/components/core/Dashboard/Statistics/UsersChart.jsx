// frontend/src/components/core/Dashboard/Statistics/UsersChart.jsx
import React, { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UsersChart = ({ userData, historicalData, darkMode }) => {
  const [chartType, setChartType] = useState("bar"); // "bar" ou "doughnut"

  // Calculer le total des utilisateurs
  const totalUsers = userData.students + userData.instructors + userData.admins;

  // Configurer les options du graphique en barres
  const barOptions = {
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
        text: "Répartition des utilisateurs",
        color: darkMode ? "#D1D5DB" : "#1F2937",
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

  // Configurer les options du graphique en donut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Répartition des utilisateurs",
        color: darkMode ? "#D1D5DB" : "#1F2937",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const percentage = Math.round((value / totalUsers) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Préparer les données pour le graphique en barres
  const barData = {
    labels: ["Apprenants", "Formateurs", "Administrateurs", "Total"],
    datasets: [
      {
        label: "Nombre d'utilisateurs",
        data: [
          userData.students,
          userData.instructors,
          userData.admins,
          totalUsers,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // blue-500
          "rgba(16, 185, 129, 0.7)", // green-500
          "rgba(139, 92, 246, 0.7)", // purple-500
          "rgba(245, 158, 11, 0.7)", // amber-500
          "rgba(236, 72, 153, 0.7)", // pink-500
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)", // blue-500
          "rgba(16, 185, 129, 1)", // green-500
          "rgba(139, 92, 246, 1)", // purple-500
          "rgba(245, 158, 11, 1)", // amber-500
          "rgba(236, 72, 153, 1)", // pink-500
        ],
        borderWidth: 1,
      },
    ],
  };

  // Préparer les données pour le graphique en donut
  const doughnutData = {
    labels: ["Apprenants", "Formateurs", "Administrateurs"],
    datasets: [
      {
        data: [userData.students, userData.instructors, userData.admins],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // blue-500
          "rgba(16, 185, 129, 0.7)", // green-500
          "rgba(139, 92, 246, 0.7)", // purple-500
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)", // blue-500
          "rgba(16, 185, 129, 1)", // green-500
          "rgba(139, 92, 246, 1)", // purple-500
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
      {/* Sélecteur de type de graphique */}
      <div className="flex justify-end mb-4">
        <div
          className={`inline-flex rounded-md ${
            darkMode ? "bg-richblack-700" : "bg-richblack-50"
          }`}
        >
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-xs rounded-l-md ${
              chartType === "bar"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Barres
          </button>
          <button
            onClick={() => setChartType("doughnut")}
            className={`px-3 py-1 text-xs rounded-r-md ${
              chartType === "doughnut"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-richblack-300"
                : "text-richblack-600"
            }`}
          >
            Donut
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === "bar" ? (
          <Bar options={barOptions} data={barData} />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 relative">
              <Doughnut options={doughnutOptions} data={doughnutData} />
            </div>

            {/* Informations supplémentaires pour le donut */}
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div className="text-center">
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  Total
                </p>
                <p
                  className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-richblack-800"
                  }`}
                >
                  {totalUsers}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersChart;
