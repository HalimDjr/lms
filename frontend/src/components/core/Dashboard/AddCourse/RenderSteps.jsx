import React from "react";
import { FaCheck, FaInfoCircle, FaTools, FaUpload } from "react-icons/fa";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm";
import CourseInformationForm from "./CourseInformation/CourseInformationForm";
import PublishCourse from "./PublishCourse";

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course);
  const { editCourse } = useSelector((state) => state.course);
  const { darkMode } = useSelector((state) => state.theme);

  const steps = [
    {
      id: 1,
      title: "Informations sur la formation",
      description: "Détails essentiels de la formation",
      icon: <FaInfoCircle />,
    },
    {
      id: 2,
      title: "Créateur de formation",
      description: "Structure et contenu",
      icon: <FaTools />,
    },
    {
      id: 3,
      title: "Publier",
      description: "Rendre disponible",
      icon: <FaUpload />,
    },
  ];

  // Animation variants
  const progressVariants = {
    initial: { width: "0%" },
    animate: (currentStep) => ({
      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  const stepVariants = {
    inactive: { scale: 1 },
    active: { scale: 1.1, transition: { duration: 0.3 } },
    completed: { scale: 1, transition: { duration: 0.3 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      {/* Progress bar */}
      <div className="relative mb-12 w-full">
        {/* Background track */}
        <div
          className={`absolute h-1 w-full rounded-full ${
            darkMode ? "bg-richblack-700" : "bg-gray-200"
          }`}
        ></div>

        {/* Progress indicator */}
        <motion.div
          className={`absolute h-1 rounded-full ${
            darkMode ? "bg-blue-400" : "bg-blue-500"
          }`}
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={step}
        ></motion.div>

        {/* Step indicators */}
        <div className="relative flex w-full select-none justify-between">
          {steps.map((item) => (
            <motion.div
              key={item.id}
              className="flex flex-col items-center"
              variants={stepVariants}
              animate={
                step === item.id
                  ? "active"
                  : step > item.id
                  ? "completed"
                  : "inactive"
              }
            >
              <motion.div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step === item.id
                    ? darkMode
                      ? "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : step > item.id
                    ? darkMode
                      ? "border-green-400 bg-green-600 text-white"
                      : "border-green-500 bg-green-500 text-white"
                    : darkMode
                    ? "border-richblack-700 bg-richblack-800 text-richblack-300"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
                whileHover={step >= item.id ? { scale: 1.05 } : {}}
              >
                {step > item.id ? (
                  <FaCheck className="text-white" />
                ) : (
                  <span className="text-sm">{item.icon}</span>
                )}
              </motion.div>

              <div
                className={`mt-3 flex flex-col items-center ${
                  editCourse ? "w-[200px]" : "w-[130px]"
                }`}
              >
                <p
                  className={`text-center font-medium ${
                    step >= item.id
                      ? darkMode
                        ? "text-blue-400"
                        : "text-blue-600"
                      : darkMode
                      ? "text-richblack-500"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </p>
                <p
                  className={`mt-1 text-center text-xs ${
                    step >= item.id
                      ? darkMode
                        ? "text-richblack-300"
                        : "text-gray-600"
                      : darkMode
                      ? "text-richblack-600"
                      : "text-gray-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current step summary */}
      <div
        className={`mb-8 rounded-lg p-4 ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-blue-50 border border-blue-100"
        }`}
      >
        <h2
          className={`text-lg font-bold ${
            darkMode ? "text-richblack-5" : "text-blue-800"
          }`}
        >
          Étape {step}: {steps.find((s) => s.id === step)?.title}
        </h2>
        <p
          className={`mt-1 text-sm ${
            darkMode ? "text-richblack-300" : "text-gray-600"
          }`}
        >
          {step === 1 &&
            "Renseignez les informations de base sur votre formation pour aider les apprenants à la découvrir."}
          {step === 2 &&
            "Créez la structure de votre formation et ajoutez du contenu pour chaque section."}
          {step === 3 &&
            "Vérifiez tous les détails et publiez votre formation pour la rendre disponible aux apprenants."}
        </p>
      </div>

      {/* Render specific component based on current step */}
      <motion.div
        key={step}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuilderForm />}
        {step === 3 && <PublishCourse />}
      </motion.div>
    </>
  );
}
