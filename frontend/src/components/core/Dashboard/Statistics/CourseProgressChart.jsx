import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CourseProgressChart = ({ progressStats, darkMode }) => {
  if (
    !progressStats ||
    !progressStats.courses ||
    !Array.isArray(progressStats.courses) ||
    progressStats.courses.length === 0
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
            Aucune donnée de progression disponible.
          </p>
        </div>
      </div>
    );
  }

  // Mapping robuste des noms de cours
  const courseNames = progressStats.courses.map((course) => {
    const name =
      course.name ||
      course.courseName ||
      (course.courseInfo && course.courseInfo.courseName) ||
      "Sans nom";
    return name.length > 15 ? name.substring(0, 15) + "..." : name;
  });

  // Mapping robuste des taux de complétion
  const completionRates = progressStats.courses.map((course) =>
    typeof course.averageCompletion === "number" ? course.averageCompletion : 0
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
        },
      },
      title: {
        display: true,
        text: "Progression moyenne par formations",
        color: darkMode ? "#D1D5DB" : "#1F2937",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Progression: ${context.raw.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
        },
      },
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: darkMode ? "#D1D5DB" : "#1F2937",
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  };

  const data = {
    labels: courseNames,
    datasets: [
      {
        label: "Taux de complétion",
        data: completionRates,
        backgroundColor: completionRates.map((rate) => {
          if (rate < 30) return "rgba(239, 68, 68, 0.7)";
          if (rate < 70) return "rgba(245, 158, 11, 0.7)";
          return "rgba(16, 185, 129, 0.7)";
        }),
        borderColor: completionRates.map((rate) => {
          if (rate < 30) return "rgba(239, 68, 68, 1)";
          if (rate < 70) return "rgba(245, 158, 11, 1)";
          return "rgba(16, 185, 129, 1)";
        }),
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
      <div className="h-80">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default CourseProgressChart;
