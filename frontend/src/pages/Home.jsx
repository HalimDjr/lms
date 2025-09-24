import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/common/Footer";
import HighlightText from "../components/core/HomePage/HighlightText";
import CTAButton from "../components/core/HomePage/Button";
import heroImage from "../assets/imh.jpg";
import FAQ from "../components/core/HomePage/FAQ";
import Navbar from "../components/common/Navbar";
import {
  fetchCourseCategories,
  getAllCourses,
} from "../services/operations/courseDetailsAPI";
import { getAllDashboardStats } from "../services/operations/statisticsAPI";
const Home = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const navigate = useNavigate();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Récupérer les catégories et les cours depuis la base de données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, coursesData] = await Promise.all([
          fetchCourseCategories(),
          getAllCourses(),
        ]);

        // Filtrer pour ne garder que les cours publiés
        const publishedCourses = coursesData.filter(
          (course) => course.status === "Published"
        );

        // Compter le nombre de cours par catégorie (uniquement les cours publiés)
        const coursesCountByCategory = {};
        publishedCourses.forEach((course) => {
          const categoryId =
            typeof course.category === "object"
              ? course.category._id
              : course.category;
          if (categoryId) {
            coursesCountByCategory[categoryId] =
              (coursesCountByCategory[categoryId] || 0) + 1;
          }
        });

        // Ajouter des icônes aux catégories et le nombre de cours
        const categoriesWithIcons = categoriesData.map((category) => ({
          ...category,
          icon: getCategoryIcon(category.name),
          courses: coursesCountByCategory[category._id] || 0,
        }));

        // Sélectionner les cours populaires (basés sur le nombre d'étudiants inscrits)
        const sortedCourses = [...publishedCourses].sort(
          (a, b) =>
            (b.studentsEnrolled?.length || 0) -
            (a.studentsEnrolled?.length || 0)
        );

        // Prendre les 3 premiers cours populaires
        const topCourses = sortedCourses.slice(0, 3).map((course) => {
          // Déterminer la catégorie du cours
          let categoryName = "Catégorie";
          if (course.category && typeof course.category === "object") {
            categoryName = course.category.name;
          } else {
            const categoryObj = categoriesData.find(
              (cat) => cat._id === course.category
            );
            if (categoryObj) categoryName = categoryObj.name;
          }

          // Calculer le nombre de leçons correctement
          let totalLectures = 0;
          if (course.courseContent && Array.isArray(course.courseContent)) {
            course.courseContent.forEach((section) => {
              if (section.subSection && Array.isArray(section.subSection)) {
                totalLectures += section.subSection.length;
              }
            });
          }

          return {
            id: course._id,
            title: course.courseName,
            description: course.courseDescription,
            image:
              course.thumbnail ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
            category: categoryName,
            lessons: totalLectures || 0,
          };
        });

        setCourses(publishedCourses);
        setCategories(categoriesWithIcons);
        setPopularCourses(topCourses);
        setLoading(false);
        setCoursesLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
        setCoursesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour associer une icône à une catégorie selon son nom
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return "📚"; // Icône par défaut si le nom est undefined

    const name = categoryName.toLowerCase();
    if (name.includes("web") || name.includes("développement")) return "💻";
    if (name.includes("sécurité")) return "🔐";
    if (name.includes("marketing")) return "📊";
    if (name.includes("logistique")) return "🛳";
    if (name.includes("business") || name.includes("entreprise")) return "💼";
    if (name.includes("environnement ")) return "🏞";
    if (name.includes("langue")) return "🌍";
    if (name.includes("personnel")) return "🧠";
    if (name.includes("data") || name.includes("données")) return "📈";
    if (name.includes("mobile")) return "📱";
    // Icône par défaut
    return "📚";
  };

  // Fonction pour naviguer vers la page des cours avec le filtre de catégorie
  const handleCategoryClick = (categoryId) => {
    navigate(`/courses?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section
        className={`relative pt-28 pb-20 px-4 md:px-8 lg:px-12 overflow-hidden ${
          darkMode ? "bg-n-8" : "bg-richblack-5"
        }`}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="code-block1-grad"></div>
          <div className="code-block2-grad"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-6">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.2 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <motion.p
                variants={fadeIn}
                className="tagline mb-6 text-blue-100"
              >
                PLATEFORME D'APPRENTISSAGE EN LIGNE
              </motion.p>

              <motion.h1
                variants={fadeIn}
                className={`h1 mb-6 ${
                  darkMode ? "text-n-1" : "text-richblack-800"
                }`}
              >
                Développez vos <HighlightText text="compétences" /> avec des
                formations de qualité
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className={`body-1 mb-8 ${
                  darkMode ? "text-n-2" : "text-richblack-600"
                } max-w-2xl mx-auto lg:mx-0`}
              >
                Accédez à une bibliothèque complète de formations créées par des
                experts du domaine. Apprenez à votre rythme, où que vous soyez.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <CTAButton active={true} linkto={"/courses"}>
                  <div className="flex items-center gap-3">
                    Explorer les formations
                    <FiArrowRight />
                  </div>
                </CTAButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeIn}
                className="mt-12 grid grid-cols-3 gap-4"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="gradient_color text-2xl lg:text-3xl font-bold">
                      {stat.number}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? "text-n-3" : "text-richblack-600"
                      }`}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="Learning Platform"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />

                {/* Floating elements */}
                <div
                  className={`absolute -top-6 -right-6 p-4 rounded-xl ${
                    darkMode ? "bg-n-6" : "bg-white"
                  } shadow-lg glass`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-richblack-900">
                      <FiArrowRight />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-n-1" : "text-richblack-900"
                        }`}
                      >
                        Devlopper
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-n-3" : "text-richblack-600"
                        }`}
                      >
                        vos competences
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute -bottom-6 -left-6 p-4 rounded-xl ${
                    darkMode ? "bg-n-6" : "bg-white"
                  } shadow-lg glass`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-richblack-900">
                      <FiArrowRight />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-n-1" : "text-richblack-900"
                        }`}
                      >
                        Certification
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-n-3" : "text-richblack-600"
                        }`}
                      >
                        après chaque formation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-24 px-4 md:px-8 lg:px-12 overflow-hidden ${
          darkMode
            ? "bg-gradient-to-b from-n-8 to-n-7"
            : "bg-gradient-to-b from-[#f7f2eb] to-[#eae0d5]"
        }`}
      >
        <div className="container mx-auto relative">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${
                darkMode ? "bg-blue-500/5" : "bg-blue-500/10"
              } blur-3xl`}
            ></div>
            <div
              className={`absolute -bottom-32 -left-20 w-80 h-80 rounded-full ${
                darkMode ? "bg-yellow-500/5" : "bg-yellow-500/10"
              } blur-3xl`}
            ></div>
          </div>

          {/* Section Header */}
          <motion.div
            className="text-center mb-20 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block mb-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-n-6 text-yellow-500"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Fonctionnalités exceptionnelles
              </span>
            </div>

            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                darkMode ? "text-n-1" : "text-[#000]"
              }`}
            >
              Pourquoi choisir <HighlightText text="notre plateforme" />
            </h2>

            <p
              className={`text-lg max-w-2xl mx-auto ${
                darkMode ? "text-n-3" : "text-richblack-700"
              }`}
            >
              Notre plateforme offre une expérience d'apprentissage complète
              avec des outils innovants et un contenu de qualité
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow: darkMode
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                className={`p-8 rounded-3xl relative overflow-hidden ${
                  darkMode
                    ? "bg-gradient-to-br from-n-6 to-n-7 border border-n-5/20"
                    : "bg-gradient-to-br from-white to-blue-50 border border-blue-100"
                } transition-all duration-300 shadow-lg`}
              >
                {/* Feature Icon with Background */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    darkMode
                      ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      : "bg-gradient-to-br from-blue-100 to-blue-200"
                  }`}
                >
                  <div
                    className={`text-3xl ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* Feature Title */}
                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-n-1" : "text-richblack-800"
                  }`}
                >
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p
                  className={`${
                    darkMode ? "text-n-3" : "text-richblack-600"
                  } leading-relaxed`}
                >
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <div className="mt-6 pt-4 border-t border-dashed border-opacity-20 border-current">
                  <a
                    href="#"
                    className={`inline-flex items-center font-medium ${
                      darkMode ? "text-yellow-500" : "text-blue-600"
                    } hover:underline`}
                  >
                    En savoir plus
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>

                {/* Decorative Element */}
                <div
                  className={`absolute -bottom-2 -right-2 w-20 h-20 rounded-full opacity-20 ${
                    darkMode ? "bg-blue-500/10" : "bg-blue-300/30"
                  }`}
                ></div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            className={`mt-16 text-center`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href="#"
              className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                darkMode
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-richblack-900 hover:shadow-lg hover:shadow-yellow-500/20"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30"
              }`}
            >
              Découvrir toutes nos fonctionnalités
            </a>
          </motion.div>
        </div>
      </section>

      {/* Popular Courses Section  */}
      <section
        className={`py-24 px-4 md:px-8 lg:px-12 ${
          darkMode ? "bg-n-8" : "bg-[#f0f8ff]"
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`h2 mb-4 ${
                darkMode ? "text-n-1" : "text-richblack-900"
              }`}
            >
              Nos formations <HighlightText text="populaires" />
            </h2>
            <p
              className={`body-2 max-w-2xl mx-auto ${
                darkMode ? "text-n-3" : "text-richblack-700"
              }`}
            >
              Découvrez nos formations les plus suivies par notre communauté
              d'apprenants.
            </p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-100"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularCourses.map((course, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden ${
                    darkMode ? "bg-n-6" : "bg-white"
                  } shadow-md hover:shadow-xl transition-all duration-300`}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          darkMode
                            ? "bg-n-7 text-blue-100"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {course.category}
                      </span>
                    </div>
                    <h3
                      className={`h6 mb-2 ${
                        darkMode ? "text-n-1" : "text-richblack-900"
                      }`}
                    >
                      {course.title}
                    </h3>
                    <p
                      className={`text-sm mb-4 line-clamp-2 ${
                        darkMode ? "text-n-3" : "text-richblack-600"
                      }`}
                    >
                      {course.description}
                    </p>
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-blue-100 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Voir la formation <FiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className=" mt-12 text-center">
            <CTAButton active={true} linkto={"/courses"}>
              <div className=" flex items-center gap-2">
                Voir tous les formations
                <FiArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        className={`py-24 px-4 md:px-8 lg:px-12 relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-b from-n-8 to-n-7"
            : "bg-gradient-to-b from-white to-blue-50"
        }`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-20 left-10 w-72 h-72 rounded-full ${
              darkMode ? "bg-blue-500/5" : "bg-blue-500/5"
            } blur-3xl`}
          ></div>
          <div
            className={`absolute bottom-10 right-10 w-96 h-96 rounded-full ${
              darkMode ? "bg-purple-500/5" : "bg-indigo-500/5"
            } blur-3xl`}
          ></div>
        </div>

        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block mb-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-n-6 text-yellow-500"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Plus de {categories.length} catégories disponibles
              </span>
            </div>

            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                darkMode ? "text-n-1" : "text-black"
              }`}
            >
              Explorez par <HighlightText text="catégorie" />
            </h2>

            <p
              className={`text-lg max-w-2xl mx-auto ${
                darkMode ? "text-n-3" : "text-richblack-700"
              }`}
            >
              Découvrez une large gamme de sujets pour développer vos
              compétences et atteindre vos objectifs professionnels
            </p>
          </motion.div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-60">
              <div className={`w-16 h-16 relative`}>
                <div
                  className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${
                    darkMode ? "border-yellow-500" : "border-blue-600"
                  }`}
                ></div>
              </div>
              <p
                className={`mt-4 font-medium ${
                  darkMode ? "text-n-3" : "text-richblack-600"
                }`}
              >
                Chargement des catégories...
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{
                    y: -8,
                    boxShadow: darkMode
                      ? "0 20px 40px -12px rgba(0, 0, 0, 0.5)"
                      : "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
                  }}
                  className={`relative p-8 rounded-2xl overflow-hidden cursor-pointer ${
                    darkMode
                      ? "bg-gradient-to-br from-n-6 to-n-7 border border-n-5/20"
                      : "bg-white border border-blue-100 shadow-sm"
                  } transition-all duration-300`}
                  onClick={() => handleCategoryClick(category._id)}
                >
                  {/* Category Icon with Background */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                      darkMode
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                        : "bg-blue-50"
                    }`}
                  >
                    <div
                      className={`text-3xl ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {category.icon}
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      darkMode ? "text-n-1" : "text-richblack-900"
                    }`}
                  >
                    {category.name}
                  </h3>

                  {/* Course Count */}
                  <div
                    className={`flex items-center mb-4 ${
                      darkMode ? "text-n-3" : "text-richblack-600"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>
                      <strong>{category.courses}</strong> formations disponibles
                    </span>
                  </div>

                  {/* Explore Button - Always Visible */}
                  <div
                    className={`flex items-center font-medium ${
                      darkMode ? "text-yellow-500" : "text-blue-600"
                    }`}
                  >
                    <span className="mr-2">Explorer</span>
                    <motion.div
                      initial={{ x: -5 }}
                      animate={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiArrowRight />
                    </motion.div>
                  </div>

                  {/* Decorative Element */}
                  <div
                    className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 ${
                      darkMode ? "bg-blue-500/20" : "bg-blue-300/30"
                    }`}
                  ></div>

                  {/* Category Indicator */}
                  <div
                    className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                      darkMode ? "bg-yellow-500" : "bg-blue-600"
                    }`}
                  ></div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Categories Button */}
          {!loading && categories.length > 0 && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a
                href="/categories"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  darkMode
                    ? "bg-n-6 text-n-1 hover:bg-n-5 border border-n-5/20"
                    : "bg-white text-richblack-900 hover:bg-blue-50 border border-blue-100 shadow-sm"
                }`}
              >
                Voir toutes les catégories
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <div
              className={`text-center py-16 rounded-2xl ${
                darkMode
                  ? "bg-n-6 border border-n-5/20"
                  : "bg-white border border-blue-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-16 w-16 mx-auto mb-4 ${
                  darkMode ? "text-n-3" : "text-richblack-300"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3
                className={`text-xl font-bold mb-2 ${
                  darkMode ? "text-n-1" : "text-richblack-900"
                }`}
              >
                Aucune catégorie disponible
              </h3>
              <p
                className={`${
                  darkMode ? "text-n-3" : "text-richblack-600"
                } max-w-md mx-auto`}
              >
                Nous ajoutons régulièrement de nouvelles catégories. Revenez
                bientôt pour découvrir notre catalogue.
              </p>
            </div>
          )}
        </div>
      </section>

      <InstructorSection />

      {/* FAQ Section */}
      <section
        className={`py-24 px-4 md:px-8 lg:px-12 relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-b from-n-8 to-n-7"
            : "bg-gradient-to-b from-[#f7f2eb] to-[#f0e9e0]"
        }`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-40 left-0 w-96 h-96 rounded-full ${
              darkMode ? "bg-blue-500/5" : "bg-blue-500/10"
            } blur-3xl`}
          ></div>
          <div
            className={`absolute bottom-20 right-0 w-80 h-80 rounded-full ${
              darkMode ? "bg-yellow-500/5" : "bg-yellow-500/10"
            } blur-3xl`}
          ></div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 opacity-20">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="40"
                cy="40"
                r="40"
                fill={darkMode ? "#FFD700" : "#4B7BF5"}
                fillOpacity="0.2"
              />
              <circle
                cx="40"
                cy="40"
                r="25"
                stroke={darkMode ? "#FFD700" : "#4B7BF5"}
                strokeWidth="2"
              />
              <circle
                cx="40"
                cy="40"
                r="10"
                fill={darkMode ? "#FFD700" : "#4B7BF5"}
              />
            </svg>
          </div>
          <div className="absolute bottom-10 left-10 opacity-20">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="60"
                height="60"
                rx="10"
                fill={darkMode ? "#FFD700" : "#4B7BF5"}
                fillOpacity="0.2"
              />
              <rect
                x="15"
                y="15"
                width="30"
                height="30"
                rx="5"
                stroke={darkMode ? "#FFD700" : "#4B7BF5"}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block mb-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-n-6 text-yellow-500"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Support & Assistance
              </span>
            </div>

            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                darkMode ? "text-n-1" : "text-black"
              }`}
            >
              Questions <HighlightText text="fréquentes" />
            </h2>

            <p
              className={`text-lg max-w-2xl mx-auto ${
                darkMode ? "text-n-3" : "text-richblack-700"
              }`}
            >
              Vous avez des questions ? Nous avons les réponses. Consultez notre
              FAQ pour trouver rapidement les informations dont vous avez
              besoin.
            </p>
          </motion.div>

          {/* FAQ Component with Custom Styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`max-w-4xl mx-auto rounded-2xl ${
              darkMode
                ? "bg-gradient-to-br from-n-6 to-n-7 border border-n-5/20 shadow-xl"
                : "bg-white border border-gray-100 shadow-xl"
            } overflow-hidden`}
          >
            <div className="p-1">
              <FAQ
                customClass={`
          [&_.faq-item]:border-b 
          [&_.faq-item]:last:border-b-0
          [&_.faq-item]:${darkMode ? "border-n-5/20" : "border-gray-100"}
          [&_.faq-item]:p-6
          [&_.faq-question]:text-lg
          [&_.faq-question]:font-medium
          [&_.faq-question]:${darkMode ? "text-n-1" : "text-richblack-800"}
          [&_.faq-question]:flex
          [&_.faq-question]:justify-between
          [&_.faq-question]:items-center
          [&_.faq-question]:cursor-pointer
          [&_.faq-question]:hover:${
            darkMode ? "text-yellow-500" : "text-blue-600"
          }
          [&_.faq-question]:transition-colors
          [&_.faq-answer]:pt-4
          [&_.faq-answer]:${darkMode ? "text-n-3" : "text-richblack-600"}
          [&_.faq-answer]:leading-relaxed
          [&_.faq-icon]:transition-transform
          [&_.faq-icon]:duration-300
          [&_.faq-icon.open]:rotate-180
        `}
              />
            </div>
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p
              className={`mb-4 ${darkMode ? "text-n-3" : "text-richblack-600"}`}
            >
              Vous ne trouvez pas la réponse que vous cherchez ?
            </p>
            <a
              href="/contact"
              className={`inline-flex items-center gap-2 font-medium ${
                darkMode ? "text-yellow-500" : "text-blue-600"
              } hover:underline`}
            >
              Contactez notre équipe de support
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className={`py-24 px-4 md:px-8 lg:px-12 relative overflow-hidden ${
          darkMode ? "bg-n-7" : "bg-[#f0f8ff]"
        }`}
      >
        <div className="absolute inset-0 z-0">
          <div className="code-block2-grad opacity-30"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className={`h2 mb-6 ${
                darkMode ? "text-n-1" : "text-richblack-900"
              }`}
            >
              Prêt à commencer votre voyage d'apprentissage ?
            </h2>
            <p
              className={`body-1 mb-8 ${
                darkMode ? "text-n-3" : "text-richblack-700"
              }`}
            >
              Rejoignez notre communauté d'apprenants et commencez à développer
              vos compétences dès aujourd'hui.
            </p>
            <CTAButton active={true} linkto={"/signup"}>
              <div className="flex items-center gap-2">
                Commencer Maintenant
                <FiArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Données statiques (conservées pour les autres sections)
const features = [
  {
    icon: "🎓",
    title: "Apprentissage flexible",
    description:
      "Accédez à tous les formations à votre rythme, où que vous soyez et quand vous voulez.",
  },
  {
    icon: "👥",
    title: "Communauté active",
    description:
      "Rejoignez une communauté dynamique d'apprenants et d'experts pour échanger et progresser ensemble.",
  },
  {
    icon: "📚",
    title: "Contenu de qualité",
    description:
      "Des formations créées par des professionnels de l'industrie pour vous garantir un apprentissage optimal.",
  },
];

const stats = [
  {
    number: "100+",
    label: "Apprenants actifs",
  },
  {
    number: "50+",
    label: "Formaions disponibles",
  },
  {
    number: "40+",
    label: "Formateurs",
  },
];

export default Home;
