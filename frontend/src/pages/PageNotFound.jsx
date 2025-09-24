import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaSearch } from "react-icons/fa";
import loginBg from "../assets/bg2.jpg";

const PageNotFound = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <motion.div
        className="max-w-5xl w-full" // Augmentation de la largeur maximale
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="text-center p-4 md:p-8">
            {" "}
            {/* Réduction du padding */}
            <div className="flex flex-col md:flex-row items-center">
              {/* Animation du 404 - hauteur réduite */}
              <motion.div
                className="relative h-[300px] md:h-[330px] w-full md:w-1/2 bg-center bg-contain bg-no-repeat"
                style={{
                  backgroundImage:
                    "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
                }}
                variants={itemVariants}
              >
                <motion.h1
                  className="text-center text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                >
                  404
                </motion.h1>
              </motion.div>

              {/* Contenu textuel */}
              <div className="w-full md:w-1/2 space-y-4 px-4 md:px-8">
                {" "}
                {/* Espacement réduit */}
                <motion.h3
                  className="text-2xl md:text-3xl font-bold text-gray-800" // Taille de texte réduite
                  variants={itemVariants}
                >
                  On dirait que vous êtes perdu
                </motion.h3>
                <motion.p
                  className="text-base text-gray-600 max-w-md mx-auto" // Taille de texte réduite
                  variants={itemVariants}
                >
                  La page que vous recherchez n'est pas disponible. Elle a
                  peut-être été déplacée ou supprimée.
                </motion.p>
                <motion.div
                  className="flex flex-row gap-4 justify-center pt-2" // Espacement réduit et toujours en ligne
                  variants={itemVariants}
                >
                  <Link to="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-6 text-sm md:text-base bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaHome /> Accueil
                    </motion.button>
                  </Link>

                  <Link to="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-6 text-sm md:text-base bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      <FaSearch /> Nous contacter
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Pied de page - hauteur réduite */}
          <motion.div
            className="bg-gray-50 p-3 text-center border-t border-gray-100" // Padding réduit
            variants={itemVariants}
          >
            <p className="text-sm text-gray-500">
              {" "}
              {/* Taille de texte réduite */}
              Retournez à la page d'accueil pour continuer votre navigation
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default PageNotFound;
