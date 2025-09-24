import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function Tab({ tabData, field, setField }) {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div
      style={{
        boxShadow: darkMode
          ? "0 8px 32px rgba(0, 0, 0, 0.3)"
          : "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
      className={`flex p-2 gap-x-2 my-8 rounded-2xl max-w-max ${
        darkMode ? "bg-richblack-800/90" : "bg-white/90"
      } backdrop-blur-md border ${
        darkMode ? "border-richblack-700" : "border-gray-100"
      }`}
    >
      {tabData.map((tab) => {
        const isActive = field === tab.type;

        return (
          <motion.button
            key={tab.id}
            onClick={() => setField(tab.type)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative py-3 px-8 rounded-xl transition-all duration-300 ${
              isActive
                ? darkMode
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold"
                  : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold"
                : darkMode
                ? "bg-transparent text-richblack-200 hover:text-white hover:bg-richblack-700"
                : "bg-transparent text-richblack-600 hover:text-richblack-900 hover:bg-richblack-50"
            }`}
          >
            {/* Effet de brillance pour l'onglet actif */}
            {isActive && (
              <motion.span
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl opacity-30 blur-md"
                style={{
                  background: darkMode
                    ? "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
                    : "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Effet de halo pour l'onglet actif */}
            {isActive && (
              <motion.span
                className="absolute inset-0 -z-10 rounded-xl opacity-40 blur-xl"
                style={{
                  background: darkMode
                    ? "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                    : "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1.2 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Contenu de l'onglet */}
            <span className="relative z-10 font-medium tracking-wide text-base">
              {tab?.tabName}
            </span>

            {/* Indicateur d'onglet actif */}
            {isActive && (
              <motion.div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                <motion.span
                  layoutId="activeIndicator"
                  className="h-1 rounded-full bg-white"
                  style={{
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
