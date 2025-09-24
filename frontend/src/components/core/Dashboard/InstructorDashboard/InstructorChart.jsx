import { useState, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiPieChart, FiBarChart, FiUsers, FiDownload } from "react-icons/fi";

Chart.register(...registerables);

export default function InstructorChart({ courses }) {
  const { darkMode } = useSelector((state) => state.theme);
  // State to keep track of the currently selected chart
  const [currChart, setCurrChart] = useState("students");
  // State to keep track of the chart type (pie or bar)
  const [chartType, setChartType] = useState("pie");
  // State to store total students
  const [totalStudents, setTotalStudents] = useState(0);

  // Calculate total students when courses change
  useEffect(() => {
    const total = courses.reduce(
      (acc, course) => acc + (course.totalStudentsEnrolled || 0),
      0
    );
    setTotalStudents(total);
  }, [courses]);

  // Function to generate consistent colors based on course name
  const generateConsistentColors = (courseName, opacity = 1) => {
    // Simple hash function to generate a number from a string
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to RGB
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Generate colors for courses
  const courseColors = courses.map((course) =>
    generateConsistentColors(course.courseName)
  );

  const courseHoverColors = courses.map((course) =>
    generateConsistentColors(course.courseName, 0.8)
  );

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        label: "Nombre d'apprenants",
        data: courses.map((course) => course.totalStudentsEnrolled || 0),
        backgroundColor: courseColors,
        hoverBackgroundColor: courseHoverColors,
        borderColor: darkMode
          ? "rgba(30, 30, 30, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  // Options for the chart
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#f1f2ff" : "#2c333f",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: darkMode
          ? "rgba(44, 51, 63, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        titleColor: darkMode ? "#f1f2ff" : "#2c333f",
        bodyColor: darkMode ? "#f1f2ff" : "#2c333f",
        borderColor: darkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} apprenants (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: darkMode ? "#f1f2ff" : "#2c333f",
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return percentage > 5 ? `${percentage}%` : "";
        },
        font: {
          weight: "bold",
          size: 12,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };

  const barOptions = {
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode
          ? "rgba(44, 51, 63, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        titleColor: darkMode ? "#f1f2ff" : "#2c333f",
        bodyColor: darkMode ? "#f1f2ff" : "#2c333f",
        borderColor: darkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            return `${value} apprenants`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: darkMode ? "#afb2bf" : "#585d69",
          font: {
            size: 11,
          },
          callback: function (value) {
            const label = this.getLabelForValue(value);
            // Tronquer les noms de cours trop longs
            return label.length > 20 ? label.substring(0, 17) + "..." : label;
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#afb2bf" : "#585d69",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  // Function to download chart as image
  const downloadChart = () => {
    const canvas = document.querySelector(".chart-container canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `apprenants-par-formation-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-1 flex-col gap-y-4 rounded-xl ${
        darkMode ? "bg-richblack-800" : "bg-white shadow-md"
      } p-6`}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`text-xl font-bold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Visualisation des données
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType("pie")}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === "pie"
                ? darkMode
                  ? "bg-richblack-700 text-blue-100"
                  : "bg-blue-50 text-blue-600"
                : darkMode
                ? "text-richblack-300 hover:bg-richblack-700"
                : "text-richblack-600 hover:bg-richblack-50"
            }`}
            title="Graphique en camembert"
          >
            <FiPieChart size={18} />
          </button>

          <button
            onClick={() => setChartType("bar")}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === "bar"
                ? darkMode
                  ? "bg-richblack-700 text-blue-100"
                  : "bg-blue-50 text-blue-600"
                : darkMode
                ? "text-richblack-300 hover:bg-richblack-700"
                : "text-richblack-600 hover:bg-richblack-50"
            }`}
            title="Graphique en barres"
          >
            <FiBarChart size={18} />
          </button>

          <button
            onClick={downloadChart}
            className={`p-2 rounded-md transition-all duration-200 ${
              darkMode
                ? "text-richblack-300 hover:bg-richblack-700 hover:text-richblack-100"
                : "text-richblack-600 hover:bg-richblack-50 hover:text-richblack-800"
            }`}
            title="Télécharger le graphique"
          >
            <FiDownload size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div
          className={`flex items-center gap-2 ${
            darkMode ? "bg-richblack-700" : "bg-richblack-50"
          } px-4 py-2 rounded-lg`}
        >
          <FiUsers className={darkMode ? "text-blue-100" : "text-blue-600"} />
          <span
            className={darkMode ? "text-richblack-5" : "text-richblack-800"}
          >
            {totalStudents} apprenants au total
          </span>
        </div>
      </div>

      <div className="space-x-4 font-semibold mt-4">
        {/* Button to switch to the "students" chart */}
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-md p-2 px-4 transition-all duration-200 ${
            currChart === "students"
              ? darkMode
                ? "bg-richblack-700 text-blue-100"
                : "bg-blue-50 text-blue-600"
              : darkMode
              ? "text-blue-400 hover:bg-richblack-700"
              : "text-blue-500 hover:bg-richblack-50"
          }`}
        >
          Apprenants par formations
        </button>
      </div>

      <div className="relative m-auto w-full h-[400px] mt-4 chart-container">
        {/* Render the chart based on the selected type */}
        {chartType === "pie" ? (
          <Pie data={chartDataStudents} options={pieOptions} />
        ) : (
          <Bar data={chartDataStudents} options={barOptions} />
        )}
      </div>

      {/* Legend for small screens */}
      <div className="mt-4 md:hidden">
        <h3
          className={`text-sm font-medium mb-2 ${
            darkMode ? "text-richblack-300" : "text-richblack-600"
          }`}
        >
          Légende:
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {courses.map((course, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: courseColors[index] }}
              ></div>
              <span
                className={`text-xs ${
                  darkMode ? "text-richblack-100" : "text-richblack-700"
                }`}
              >
                {course.courseName} ({course.totalStudentsEnrolled || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* No data message */}
      {courses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            className={`text-lg ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Aucune donnée disponible
          </p>
        </div>
      )}
    </motion.div>
  );
}
