import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllCourses,
  fetchCourseCategories,
} from "../services/operations/courseDetailsAPI";
import CourseCard from "../components/common/Course_Card";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";

import Footer from "../components/common/Footer";
const CoursesPage = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [difficulty, setDifficulty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Utiliser useLocation pour récupérer les paramètres d'URL
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch courses and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getAllCourses(),
          fetchCourseCategories(),
        ]);

        // Filtrer pour ne garder que les cours publiés
        const publishedCourses = coursesData.filter(
          (course) => course.status === "Published"
        );

        // Associer les noms de catégories aux cours
        const coursesWithCategoryNames = publishedCourses.map((course) => {
          // Si la catégorie est déjà un objet complet, on le garde
          if (
            course.category &&
            typeof course.category === "object" &&
            course.category.name
          ) {
            return course;
          }

          // Sinon, on cherche la catégorie correspondante
          const categoryId = course.category;
          const categoryObj = categoriesData.find(
            (cat) => cat._id === categoryId
          );

          return {
            ...course,
            categoryName: categoryObj ? categoryObj.name : "Catégorie inconnue",
            categoryId: categoryId,
          };
        });

        setCourses(coursesWithCategoryNames);
        setFilteredCourses(coursesWithCategoryNames);
        setCategories(categoriesData);

        // Vérifier s'il y a un paramètre de catégorie dans l'URL
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get("category");

        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...courses];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = result.filter(
        (course) =>
          course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((course) => {
        // Vérifier toutes les formes possibles de la catégorie
        if (
          course.category &&
          typeof course.category === "object" &&
          course.category._id
        ) {
          return course.category._id === selectedCategory;
        } else if (course.categoryId) {
          return course.categoryId === selectedCategory;
        } else {
          return course.category === selectedCategory;
        }
      });
    }

    // Apply difficulty filter
    if (difficulty !== "all") {
      result = result.filter(
        (course) =>
          course.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "popular") {
      result.sort(
        (a, b) =>
          (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0)
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const aRating =
          a.ratingAndReviews?.reduce((acc, review) => acc + review.rating, 0) /
          (a.ratingAndReviews?.length || 1);
        const bRating =
          b.ratingAndReviews?.reduce((acc, review) => acc + review.rating, 0) /
          (b.ratingAndReviews?.length || 1);
        return bRating - aRating;
      });
    }

    setFilteredCourses(result);
  }, [searchTerm, selectedCategory, sortBy, difficulty, courses]);

  // Mettre à jour l'URL lorsque la catégorie sélectionnée change
  useEffect(() => {
    if (selectedCategory !== "all") {
      navigate(`/courses?category=${selectedCategory}`, { replace: true });
    } else {
      navigate("/courses", { replace: true });
    }
  }, [selectedCategory, navigate]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
    setDifficulty("all");
  };

  // Fonction pour revenir en arrière
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-b from-richblack-900 to-richblack-800"
          : "bg-gradient-to-b from-white to-gray-50"
      }`}
    >
      {/* Bouton de retour */}
      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            darkMode
              ? "bg-richblack-700 text-white hover:bg-richblack-600"
              : "bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
          } transition-all duration-300`}
        >
          <FaArrowLeft
            className={darkMode ? "text-blue-400" : "text-blue-600"}
          />
          <span>Retour</span>
        </motion.button>
      </div>

      {/* Hero Section */}
      <div
        className={`relative ${
          darkMode
            ? "bg-gradient-to-r from-blue-900 to-indigo-900"
            : "bg-gradient-to-r from-blue-600 to-indigo-600"
        } text-white`}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-24 pt-4 sm:px-6 lg:px-8">
          {/* Bouton de retour */}
          <div className="relative z-10 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-white hover:bg-richblack-600"
                  : "bg-white/90 text-blue-600 hover:bg-white shadow-sm"
              } transition-all duration-300`}
            >
              <FaArrowLeft />
              <span>Retour</span>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Découvrez nos formations d'excellence
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Explorez notre catalogue et commencez votre parcours
              d'apprentissage
            </p>

            {/* Barre de recherche principale */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-6 py-4 rounded-full ${
                  darkMode
                    ? "bg-richblack-800 text-white border border-richblack-700"
                    : "text-gray-800 bg-white/95"
                } shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none`}
              />
              <FaSearch
                className={`absolute right-6 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                } text-xl`}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Filtres rapides */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === "all"
                  ? darkMode
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : darkMode
                  ? "bg-richblack-700 text-gray-300 hover:bg-richblack-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Tous les formations
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category._id
                    ? darkMode
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : darkMode
                    ? "bg-richblack-700 text-gray-300 hover:bg-richblack-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filtres avancés */}
        <motion.div
          initial={false}
          animate={showFilters ? "open" : "closed"}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-white hover:bg-richblack-600"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FaFilter
                className={darkMode ? "text-blue-400" : "text-blue-600"}
              />
              <span>Filtres avancés</span>
            </button>

            {/* Tri */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-white border-richblack-600"
                    : "bg-white border border-gray-200"
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="newest">Plus récents</option>
                <option value="popular">Plus populaires</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`${
                darkMode
                  ? "bg-richblack-800 border border-richblack-700"
                  : "bg-white shadow-lg"
              } rounded-xl p-6 mt-4`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Niveau */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Niveau
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={`w-full p-3 rounded-lg ${
                      darkMode
                        ? "bg-richblack-700 text-white border-richblack-600"
                        : "border border-gray-200"
                    } focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">Tous les niveaux</option>
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                  </select>
                </div>

                {/* Autres filtres peuvent être ajoutés ici */}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={resetFilters}
                  className={`px-6 py-2 ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Résultats */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`w-16 h-16 border-4 ${
                darkMode
                  ? "border-blue-500 border-t-richblack-900"
                  : "border-blue-600 border-t-transparent"
              } rounded-full`}
            />
            <p
              className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Chargement des formations...
            </p>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    {filteredCourses.length} formations disponibles
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-20 rounded-2xl ${
                  darkMode
                    ? "bg-richblack-800 border border-richblack-700"
                    : "bg-white shadow-sm"
                }`}
              >
                {/* Illustration SVG intégrée */}
                <svg
                  className="w-64 h-64 mx-auto mb-6"
                  viewBox="0 0 500 500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fond */}
                  <circle
                    cx="250"
                    cy="250"
                    r="200"
                    fill={darkMode ? "#1E293B" : "#F5F7FF"}
                  />

                  {/* Éléments de recherche */}
                  <circle
                    cx="217"
                    cy="203"
                    r="120"
                    fill={darkMode ? "#0F172A" : "#E6EEFF"}
                  />

                  {/* Loupe */}
                  <circle
                    cx="217"
                    cy="203"
                    r="70"
                    stroke={darkMode ? "#60A5FA" : "#3B82F6"}
                    strokeWidth="8"
                    fill={darkMode ? "#1E293B" : "white"}
                  />
                  <line
                    x1="265"
                    y1="250"
                    x2="320"
                    y2="305"
                    stroke={darkMode ? "#60A5FA" : "#3B82F6"}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Livres/documents */}
                  <rect
                    x="130"
                    y="330"
                    width="240"
                    height="30"
                    rx="5"
                    fill={darkMode ? "#60A5FA" : "#3B82F6"}
                    opacity="0.7"
                  />
                  <rect
                    x="150"
                    y="300"
                    width="200"
                    height="30"
                    rx="5"
                    fill={darkMode ? "#60A5FA" : "#3B82F6"}
                    opacity="0.5"
                  />
                  <rect
                    x="170"
                    y="270"
                    width="160"
                    height="30"
                    rx="5"
                    fill={darkMode ? "#60A5FA" : "#3B82F6"}
                    opacity="0.3"
                  />

                  {/* Icône de recherche vide */}
                  <path
                    d="M217 173 L217 233 M187 203 L247 203"
                    stroke={darkMode ? "#334155" : "#94A3B8"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  } mb-2`}
                >
                  Aucun cours trouvé
                </h3>
                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } mb-6`}
                >
                  Essayez de modifier vos critères de recherche
                </p>
                <button
                  onClick={resetFilters}
                  className={`px-8 py-3 ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-full transition-colors`}
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;
