// frontend/src/components/core/Dashboard/Statistics/StatCard.jsx
import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color, darkMode }) => {
  // Définir les couleurs en fonction du thème et de la couleur spécifiée
  const getColors = () => {
    const colorMap = {
      blue: {
        light: {
          bg: "bg-blue-50",
          text: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        dark: {
          bg: "bg-blue-900/20",
          text: "text-blue-400",
          iconBg: "bg-blue-800/50",
        },
      },
      green: {
        light: {
          bg: "bg-green-50",
          text: "text-green-600",
          iconBg: "bg-green-100",
        },
        dark: {
          bg: "bg-green-900/20",
          text: "text-green-400",
          iconBg: "bg-green-800/50",
        },
      },
      purple: {
        light: {
          bg: "bg-purple-50",
          text: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        dark: {
          bg: "bg-purple-900/20",
          text: "text-purple-400",
          iconBg: "bg-purple-800/50",
        },
      },
      yellow: {
        light: {
          bg: "bg-yellow-50",
          text: "text-yellow-600",
          iconBg: "bg-yellow-100",
        },
        dark: {
          bg: "bg-yellow-900/20",
          text: "text-yellow-400",
          iconBg: "bg-yellow-800/50",
        },
      },
    };

    return darkMode ? colorMap[color].dark : colorMap[color].light;
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colors.bg} ${
        darkMode ? "shadow-md shadow-richblack-700" : "shadow-md"
      } rounded-xl p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            {title}
          </p>
          <h3 className={`text-2xl font-bold mt-2 ${colors.text}`}>
            {value.toLocaleString()}
          </h3>
        </div>
        <div className={`${colors.iconBg} p-3 rounded-full`}>
          <div className={`text-xl ${colors.text}`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
