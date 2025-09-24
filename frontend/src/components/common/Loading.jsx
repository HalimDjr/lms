import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Loading = ({ size = "medium", text = "Loading..." }) => {
  const { darkMode } = useSelector((state) => state.theme);

  // Définir les tailles
  const sizes = {
    small: { container: "h-6 w-6", dots: "h-1.5 w-1.5" },
    medium: { container: "h-12 w-12", dots: "h-2.5 w-2.5" },
    large: { container: "h-16 w-16", dots: "h-3 w-3" },
  };

  // Animation des points
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    animate: (i) => ({
      scale: [0.8, 1.2, 0.8],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: i * 0.15,
      },
    }),
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 py-6">
      <motion.div
        className={`relative ${sizes[size].container}`}
        variants={containerVariants}
        animate="animate"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${sizes[size].dots} rounded-full`}
            style={{
              backgroundColor: darkMode
                ? `rgba(99, 102, 241, ${0.7 + (i % 4) * 0.1})`
                : `rgba(79, 70, 229, ${0.7 + (i % 4) * 0.1})`,
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 45}deg) translateX(${
                sizes[size] === sizes.small
                  ? "8px"
                  : sizes[size] === sizes.medium
                  ? "16px"
                  : "22px"
              }) translateY(-50%)`,
              transformOrigin: "left",
            }}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            custom={i}
          />
        ))}
      </motion.div>

      {text && (
        <motion.p
          className={`text-sm font-medium ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loading;
