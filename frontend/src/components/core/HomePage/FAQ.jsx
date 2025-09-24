import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { FaQuestionCircle } from "react-icons/fa";

const FAQ = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-1"
      ></motion.div>

      {/* FAQ Items */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {faqData.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`rounded-xl overflow-hidden ${
              darkMode
                ? "bg-gradient-to-r from-richblack-800 to-richblack-900 border border-richblack-700"
                : "bg-white border border-gray-100"
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <button
              className={`flex justify-between items-center w-full p-6 text-left transition-colors duration-300 ${
                activeIndex === index
                  ? darkMode
                    ? "bg-richblack-700"
                    : "bg-blue-50"
                  : ""
              }`}
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
            >
              <h3
                className={`font-semibold text-lg ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {item.question}
              </h3>
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ml-4 ${
                  activeIndex === index
                    ? darkMode
                      ? "bg-blue-500 text-white"
                      : "bg-blue-600 text-white"
                    : darkMode
                    ? "bg-richblack-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                } transition-colors duration-300`}
              >
                {activeIndex === index ? <FiMinus /> : <FiPlus />}
              </span>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className={`p-6 ${
                      darkMode
                        ? "border-t border-richblack-700 text-gray-300"
                        : "border-t border-gray-100 text-gray-600"
                    }`}
                  >
                    <p className="leading-relaxed">{item.answer}</p>

                    {/* Additional action button for some items */}
                    {(index === 0 || index === 2) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        } transition-colors duration-200`}
                      >
                        {index === 0
                          ? "Explorer les cours"
                          : "Voir un exemple de certificat"}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-12 p-6 rounded-xl text-center ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-blue-50 border border-blue-100"
        }`}
      >
        <h3
          className={`text-xl font-semibold mb-2 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Vous avez d'autres questions ?
        </h3>
        <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Notre équipe de support est disponible pour vous aider
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-lg font-medium ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } transition-colors duration-200 shadow-lg`}
        >
          Contactez-nous
        </motion.button>
      </motion.div>

      {/* Search FAQ - Optional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 text-center"
      >
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Vous pouvez également consulter notre{" "}
          <a
            href="#"
            className={`${
              darkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            } underline`}
          >
            centre d'aide complet
          </a>{" "}
          pour plus d'informations.
        </p>
      </motion.div>
    </div>
  );
};

// Données FAQ
const faqData = [
  {
    question: "Comment puis-je m'inscrire à un cours ?",
    answer:
      "L'inscription à un cours est simple. Naviguez vers la page du cours qui vous intéresse, cliquez sur le bouton 'S'inscrire' et suivez les instructions. Tous nos cours sont gratuits et accessibles immédiatement après l'inscription.",
  },
  {
    question: "Les cours sont-ils vraiment gratuits ?",
    answer:
      "Oui, tous les cours sur notre plateforme sont entièrement gratuits. Notre mission est de rendre l'éducation accessible à tous, sans barrière financière. Vous pouvez accéder à l'ensemble du contenu sans frais.",
  },
  {
    question: "Comment obtenir un certificat après avoir terminé un cours ?",
    answer:
      "Une fois que vous avez terminé toutes les leçons et réussi l'évaluation finale d'un cours, vous pouvez télécharger votre certificat directement depuis votre tableau de bord. Ce certificat atteste de vos nouvelles compétences et peut être partagé sur votre CV ou profil LinkedIn.",
  },
  {
    question: "Puis-je suivre les cours à mon propre rythme ?",
    answer:
      "Absolument ! Nos cours sont conçus pour être suivis à votre propre rythme. Vous pouvez commencer, mettre en pause et reprendre votre apprentissage quand vous le souhaitez. Il n'y a pas de délai pour terminer un cours.",
  },
  {
    question: "Comment puis-je devenir instructeur sur la plateforme ?",
    answer:
      "Pour devenir instructeur, vous devez remplir un formulaire de candidature disponible dans la section 'Devenir instructeur'. Notre équipe examinera votre profil et vos compétences, puis vous contactera pour discuter des prochaines étapes.",
  },
];

export default FAQ;
