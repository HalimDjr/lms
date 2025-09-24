import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCertificate,
  FaUserGraduate,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdAdd, MdSchool, MdOutlineVerified } from "react-icons/md";
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI";
import Loading from "../../../common/Loading";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function InstructorCertificates() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetchInstructorCourses(token);
        const certifiedCourses = response.filter(
          (course) => course.isCertified
        );
        setCourses(certifiedCourses);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
        toast.error("Erreur lors du chargement des cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  const filteredAndSortedCourses = React.useMemo(() => {
    let result = [...courses];

    if (searchTerm) {
      result = result.filter((course) =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "students":
        result.sort(
          (a, b) =>
            (b.studentsEnrolled?.length || 0) -
            (a.studentsEnrolled?.length || 0)
        );
        break;
      case "name":
        result.sort((a, b) => a.courseName.localeCompare(b.courseName));
        break;
      case "recent":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [courses, searchTerm, sortBy]);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Gestion des Certificats
          </h1>
          <p
            className={`mt-2 ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Gérez les certificats de vos cours certifiants
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard/my-courses")}
            className={`flex items-center gap-x-2 rounded-lg py-2 px-4 font-semibold transition-all duration-200 ${
              darkMode
                ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                : "bg-richblack-100 text-richblack-700 hover:bg-richblack-200"
            }`}
          >
            <FaArrowLeft />
            Retour
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      {courses.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-lg px-4 py-2 pl-10 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-white text-richblack-800 border-gray-200"
              } border focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-yellow-50" : "focus:ring-blue-500"
              }`}
            />
            <MdSchool
              className={`absolute left-3 top-3 ${
                darkMode ? "text-richblack-300" : "text-richblack-400"
              }`}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`rounded-lg px-4 py-2 ${
              darkMode
                ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                : "bg-white text-richblack-800 border-gray-200"
            } border focus:outline-none focus:ring-2 ${
              darkMode ? "focus:ring-yellow-50" : "focus:ring-blue-500"
            }`}
          >
            <option value="recent">Plus récents</option>
            <option value="students">Nombre d'étudiants</option>
            <option value="name">Ordre alphabétique</option>
          </select>
        </div>
      )}

      {/* Contenu principal */}
      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col items-center justify-center h-80 rounded-lg ${
            darkMode ? "bg-richblack-800" : "bg-gray-50"
          }`}
        >
          <FaCertificate
            size={60}
            className={`${darkMode ? "text-yellow-50" : "text-blue-600"} mb-6`}
          />
          <h2
            className={`text-2xl font-bold mb-2 ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Aucun cours certifiant
          </h2>
          <p
            className={`text-center mb-6 max-w-md ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Créez un cours et activez l'option de certification pour permettre à
            vos étudiants d'obtenir des certificats.
          </p>
          <button
            onClick={() => navigate("/dashboard/add-course")}
            className={`flex items-center gap-x-2 rounded-lg py-3 px-6 font-semibold transition-all duration-200 ${
              darkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <MdAdd size={20} />
            Créer un cours certifiant
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedCourses.map((course) => (
            <motion.div
              key={course._id}
              variants={itemVariants}
              className={`group relative rounded-xl overflow-hidden ${
                darkMode
                  ? "bg-gradient-to-br from-richblack-700 to-richblack-800"
                  : "bg-gradient-to-br from-white to-gray-50"
              } shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {/* Badge Certifiant */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md bg-opacity-80 bg-black text-white text-xs font-medium">
                <MdOutlineVerified className="text-yellow-400" />
                <span>Certifiant</span>
              </div>

              {/* Image avec overlay */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    darkMode ? "from-richblack-900" : "from-gray-900"
                  } to-transparent opacity-60 z-[1]`}
                ></div>
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaUserGraduate
                    className={`${
                      darkMode ? "text-yellow-400" : "text-blue-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-yellow-50" : "text-blue-700"
                    }`}
                  >
                    {course.studentsEnrolled?.length || 0} étudiants
                  </span>

                  <span className="mx-2 text-gray-400">•</span>

                  <FaCalendarAlt
                    className={`${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    {formatDate(course.createdAt)}
                  </span>
                </div>

                <h2
                  className={`text-xl font-bold mb-3 line-clamp-2 ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {course.courseName}
                </h2>

                <p
                  className={`text-sm mb-5 line-clamp-2 ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  {course.courseDescription}
                </p>

                <div className="flex justify-between items-center">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-50"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <FaCertificate />
                    <span>Certificats disponibles</span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/course/${course._id}/certificates`)
                    }
                    className={`rounded-full p-2 transition-all duration-200 ${
                      darkMode
                        ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    aria-label="Gérer les certificats"
                  >
                    <FaArrowLeft className="rotate-180" />
                  </button>
                </div>
              </div>

              {/* Bouton d'action principal */}
              <div
                className={`absolute inset-x-0 bottom-0 h-16 flex items-center justify-center translate-y-16 group-hover:translate-y-0 transition-transform duration-300 ${
                  darkMode
                    ? "bg-gradient-to-t from-richblack-900 to-transparent"
                    : "bg-gradient-to-t from-gray-900 to-transparent"
                }`}
              >
                <button
                  onClick={() =>
                    navigate(`/dashboard/course/${course._id}/certificates`)
                  }
                  className={`flex items-center gap-x-2 rounded-lg py-2 px-6 font-semibold ${
                    darkMode
                      ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } transition-all duration-200`}
                >
                  <FaCertificate />
                  Gérer les certificats
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
