import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import GetAvgRating from "../../utils/avgRating";
import RatingStars from "./RatingStars";
import Img from "./Img";
import {
  FaUserGraduate,
  FaRegClock,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";

function Course_Card({ course, Height, isFeatured = false }) {
  const { darkMode } = useSelector((state) => state.theme);
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Fonction pour calculer la moyenne des évaluations
    const calculateAverageRating = () => {
      // Vérifier si les évaluations existent et sont un tableau
      if (
        !course?.ratingAndReviews ||
        !Array.isArray(course.ratingAndReviews)
      ) {
        return 0;
      }

      // Si le tableau est vide, retourner 0
      if (course.ratingAndReviews.length === 0) {
        return 0;
      }

      // Calculer la somme des évaluations
      const sum = course.ratingAndReviews.reduce((total, review) => {
        // Vérifier si l'évaluation a une propriété rating valide
        const rating = review.rating || 0;
        return total + rating;
      }, 0);

      // Calculer et retourner la moyenne arrondie à une décimale
      return parseFloat((sum / course.ratingAndReviews.length).toFixed(1));
    };

    // Calculer et définir la note moyenne
    const avgRating = calculateAverageRating();
    setAvgReviewCount(avgRating);

    // Log pour le débogage
    console.log("Course:", course.courseName);
    console.log("Ratings:", course.ratingAndReviews);
    console.log("Calculated average:", avgRating);
  }, [course]);

  // Limiter la description à un certain nombre de caractères
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Déterminer le niveau de difficulté
  const getDifficultyBadge = () => {
    const difficulty = course?.difficulty?.toLowerCase() || "intermédiaire";

    if (darkMode) {
      switch (difficulty) {
        case "débutant":
          return "bg-gradient-to-r from-green-600 to-green-500 text-white";
        case "intermédiaire":
          return "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white";
        case "avancé":
          return "bg-gradient-to-r from-red-600 to-red-500 text-white";
        default:
          return "bg-gradient-to-r from-blue-600 to-blue-500 text-white";
      }
    } else {
      switch (difficulty) {
        case "débutant":
          return "bg-gradient-to-r from-green-500 to-green-400 text-white";
        case "intermédiaire":
          return "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white";
        case "avancé":
          return "bg-gradient-to-r from-red-500 to-red-400 text-white";
        default:
          return "bg-gradient-to-r from-blue-500 to-blue-400 text-white";
      }
    }
  };

  // Animation variants
  const cardVariants = {
    hover: {
      y: -8,
      boxShadow: darkMode
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    initial: {
      y: 0,
      boxShadow: darkMode
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.6)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative flex w-full sm:w-80 flex-col rounded-2xl ${
        darkMode
          ? "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700"
          : "bg-white border border-gray-100"
      } overflow-hidden ${
        isFeatured ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      style={{ maxHeight: Height || "420px" }}
    >
      <Link to={`/courses/${course._id}`} className="flex flex-col h-full">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {/* Badge de difficulté */}
          {course?.difficulty && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${getDifficultyBadge()} flex items-center gap-1`}
            >
              <FaShieldAlt size={10} />
              {course.difficulty}
            </motion.div>
          )}
        </div>

        {/* Badge de popularité */}
        {course?.ratingAndReviews?.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1"
          >
            <FaGraduationCap size={10} />
            Populaire
          </motion.div>
        )}

        {/* Image du cours avec overlay au survol */}
        <div className="relative h-40 overflow-hidden">
          <Img
            src={course?.thumbnail}
            alt={course?.courseName || "Course thumbnail"}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              darkMode
                ? "from-gray-900 via-gray-900/70"
                : "from-gray-900 via-gray-800/50"
            } to-transparent`}
          ></div>

          {/* Affichage des étoiles de notation 
          <div className="absolute bottom-3 left-3 flex items-center bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 shadow-lg">
            <span className="text-yellow-400 mr-1 font-bold">
              {avgReviewCount}
            </span>
            <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
            <span className="text-xs text-gray-300 ml-1">
              ({course?.ratingAndReviews?.length || 0})
            </span>
          </div>*/}
        </div>

        {/* Contenu de la carte */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Catégorie du cours */}
          {course?.category && (
            <div className="mb-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  darkMode
                    ? "bg-blue-900/40 text-blue-300 border border-blue-800/50"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                } inline-block`}
              >
                {course.category.name}
              </span>
            </div>
          )}

          {/* Titre du cours */}
          <h5
            className={`mb-2 font-sans text-lg font-bold leading-tight tracking-tight ${
              darkMode
                ? "text-white group-hover:text-blue-300"
                : "text-gray-800 group-hover:text-blue-600"
            } transition-colors duration-300`}
          >
            {truncateText(course?.courseName, 40)}
          </h5>

          {/* Description du cours */}
          <p
            className={`mb-3 font-sans text-xs leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {truncateText(course?.courseDescription, 80)}
          </p>

          {/* Ligne de séparation */}
          <div className="mt-auto">
            <div
              className={`border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } my-2`}
            ></div>

            {/* Informations sur l'instructeur et la durée */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`p-1 rounded-full mr-1.5 ${
                    darkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <FaChalkboardTeacher
                    className={`${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                    size={12}
                  />
                </div>
                <p
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {course?.instructor?.firstName} {course?.instructor?.lastName}
                </p>
              </div>

              {/* Durée du cours */}
              {course?.duration && (
                <div
                  className={`flex items-center ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } bg-opacity-20 rounded-full px-1.5 py-0.5 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <FaRegClock className="mr-1" size={10} />
                  <span className="text-xs">{course.duration}</span>
                </div>
              )}
            </div>

            {/* Nombre d'étudiants inscrits */}
            {course?.studentsEnrolled && (
              <div
                className={`flex items-center mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } bg-opacity-20 rounded-full px-1.5 py-0.5 ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-100"
                } inline-block`}
              >
                <FaUserGraduate className="mr-1" size={10} />
                <span className="text-xs">
                  {course.studentsEnrolled.length} Apprenants inscrits
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bouton/indication visuelle au bas de la carte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`${
            darkMode
              ? "bg-gradient-to-r from-blue-600 to-indigo-600"
              : "bg-gradient-to-r from-blue-500 to-indigo-500"
          } text-center py-2 text-xs font-bold text-white`}
        >
          Voir la formations
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default Course_Card;
