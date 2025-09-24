import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaClipboard,
  FaPlay,
  FaSearch,
  FaFilter,
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getQuizForStudent } from "../../../services/operations/quizAPI";
import toast from "react-hot-toast";

import Img from "./../../common/Img";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState({});

  useEffect(() => {
    const getEnrolledCourses = async () => {
      try {
        const res = await getUserEnrolledCourses(token);
        console.log("Cours reçus:", res);

        // Créer un objet pour stocker les quiz déjà passés
        const quizStatus = {};

        // Pour chaque cours avec un quiz final, vérifier s'il a déjà été passé
        for (const course of res) {
          if (
            course.finalQuiz &&
            course.finalQuizDetails?.publie === true &&
            course.progressPercentage === 100
          ) {
            try {
              const quizResponse = await getQuizForStudent(
                course.finalQuiz,
                token
              );
              quizStatus[course.finalQuiz] = quizResponse.alreadyTaken || false;
            } catch (error) {
              console.log(
                `Erreur lors de la vérification du quiz ${course.finalQuiz}:`,
                error
              );
            }
          }
        }

        setCompletedQuizzes(quizStatus);
        setEnrolledCourses(res);
      } catch (error) {
        console.log("Could not fetch enrolled courses.");
        toast.error("Impossible de récupérer vos cours");
      }
    };

    getEnrolledCourses();
  }, [token]);

  // Filter and sort courses
  const filteredCourses = enrolledCourses
    ?.filter(
      (course) =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "name") {
        return a.courseName.localeCompare(b.courseName);
      } else if (sortBy === "progress") {
        return (b.progressPercentage || 0) - (a.progressPercentage || 0);
      }
      return 0;
    });

  // Loading Skeleton
  const sklItem = () => {
    return (
      <div
        className={`flex border ${
          darkMode ? "border-richblack-700" : "border-richblack-200"
        } px-5 py-3 w-full`}
      >
        <div className="flex flex-1 gap-x-4">
          <div className="h-14 w-14 rounded-lg skeleton"></div>
          <div className="flex flex-col w-[40%]">
            <p className="h-2 w-[50%] rounded-xl skeleton"></p>
            <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
          </div>
        </div>
        <div className="flex flex-[0.4] flex-col">
          <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
        </div>
      </div>
    );
  };

  // Fonction pour gérer le clic sur le bouton du quiz
  const handleTakeQuiz = async (courseId, quizId, e) => {
    e.stopPropagation(); // Empêcher la navigation vers le cours

    try {
      // Vérifier si l'étudiant a déjà passé le quiz
      const response = await getQuizForStudent(quizId, token);

      // Si l'examen a déjà été passé, rediriger vers la page des résultats
      if (response.alreadyTaken) {
        navigate(`/dashboard/quiz/${quizId}/result`);
      } else {
        // Sinon, rediriger vers la page pour passer l'examen
        navigate(`/dashboard/quiz/${quizId}/take`);
      }
    } catch (error) {
      // Amélioration du débogage d'erreur
      toast.error("Erreur lors de l'accès à l'examen");
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative mb-6">
          <h1
            className={`text-3xl md:text-4xl font-bold leading-tight ${
              darkMode ? "text-white" : "text-blue-900"
            } `}
          >
            Mes formations
          </h1>
          <div
            className={`h-1 w-20 mt-2 rounded-full ${
              darkMode ? "bg-yellow-50" : "bg-[#0a2f59]"
            }`}
          ></div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-richblack-400" : "text-richblack-500"
              }`}
            />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-richblack-5 text-richblack-800 border-richblack-200"
              } focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-yellow-50" : "focus:ring-blue-500"
              } transition-all duration-300`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl ${
              darkMode
                ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
            } transition-all duration-300 hover:shadow-md`}
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`mb-8 p-6 rounded-xl ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white shadow-md border border-richblack-100"
          }`}
        >
          <div className="flex flex-wrap gap-6">
            <div className="flex-grow">
              <label
                className={`block mb-2 text-sm font-medium ${
                  darkMode ? "text-richblack-300" : "text-richblack-600"
                }`}
              >
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full p-3 rounded-xl ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } border focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-yellow-50" : "focus:ring-blue-500"
                } transition-all duration-300`}
              >
                <option value="recent">Plus récents</option>
                <option value="name">Nom (A-Z)</option>
                <option value="progress">Progression</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("recent");
                }}
                className={`px-6 py-3 rounded-xl ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                    : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
                } transition-all duration-300 hover:shadow-md`}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Courses List */}
      <div
        className={`rounded-2xl overflow-hidden ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-lg"
        }`}
      >
        {/* Headings */}
        <div
          className={`flex rounded-t-2xl ${
            darkMode
              ? "bg-gradient-to-r from-richblack-700 to-richblack-800"
              : "bg-gradient-to-r from-blue-50 to-richblack-50"
          }`}
        >
          <p
            className={`w-[45%] px-6 py-4 font-semibold ${
              darkMode ? "text-yellow-50" : "text-blue-800"
            }`}
          >
            Nom de la formation
          </p>
          <p
            className={`w-1/4 px-4 py-4 font-semibold ${
              darkMode ? "text-yellow-50" : "text-blue-800"
            }`}
          >
            Durée
          </p>
          <p
            className={`flex-1 px-4 py-4 font-semibold ${
              darkMode ? "text-yellow-50" : "text-blue-800"
            }`}
          >
            Progression
          </p>
          <p
            className={`w-1/6 px-4 py-4 font-semibold text-center ${
              darkMode ? "text-yellow-50" : "text-blue-800"
            }`}
          >
            Examen
          </p>
        </div>

        {/* Loading Skeleton */}
        {!enrolledCourses && (
          <div>
            {sklItem()}
            {sklItem()}
            {sklItem()}
          </div>
        )}

        {/* Course Items */}
        {enrolledCourses?.length === 0 && (
          <div
            className={`p-12 text-center ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <FaClipboard size={48} className="opacity-30" />
              <p className="text-lg">
                Vous n'êtes inscrit à aucun formations pour le moment.
              </p>
            </div>
          </div>
        )}

        {filteredCourses?.length === 0 && enrolledCourses?.length > 0 && (
          <div
            className={`p-12 text-center ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <FaSearch size={48} className="opacity-30" />
              <p className="text-lg">
                Aucun formations ne correspond à votre recherche.
              </p>
            </div>
          </div>
        )}

        {filteredCourses?.map((course, i, arr) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`group flex flex-col sm:flex-row sm:items-center ${
              darkMode
                ? "border-b border-richblack-700"
                : "border-b border-richblack-100"
            } ${
              i === arr.length - 1 ? "rounded-b-2xl" : ""
            } hover:bg-opacity-50 ${
              darkMode ? "hover:bg-richblack-700" : "hover:bg-blue-50/30"
            } transition-all duration-300`}
          >
            {/* Course Info */}
            <div
              className="flex sm:w-[45%] cursor-pointer items-center gap-4 px-6 py-5"
              onClick={() => {
                navigate(
                  `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                );
              }}
            >
              <div className="relative group/img">
                <Img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-16 w-16 rounded-xl object-cover transition-transform duration-300 group-hover/img:scale-105 shadow-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-40 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                  <div className="bg-white/90 rounded-full p-2">
                    <FaPlay className="text-richblack-800" size={10} />
                  </div>
                </div>
              </div>

              <div className="flex max-w-xs flex-col gap-1">
                <p
                  className={`font-semibold group-hover:text-blue-500 transition-colors duration-300 ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {course.courseName}
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  {course.courseDescription.length > 50
                    ? `${course.courseDescription.slice(0, 50)}...`
                    : course.courseDescription}
                </p>
                <div className="flex gap-2 mt-2">
                  {course.isCertified && (
                    <div
                      className={`flex flex-row items-center gap-1 rounded-full ${
                        darkMode ? "bg-green-900/20" : "bg-green-50"
                      } px-2 py-[2px] text-[10px] font-medium ${
                        darkMode ? "text-green-300" : "text-green-600"
                      }`}
                    >
                      <FaCertificate size={10} />
                      Certifiant
                    </div>
                  )}
                  <div
                    className={`flex flex-row items-center gap-1 rounded-full ${
                      darkMode ? "bg-blue-900/20" : "bg-blue-50"
                    } px-2 py-[2px] text-[10px] font-medium ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    <FaClock size={10} />
                    {course?.totalDuration || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden px-6 py-4 flex flex-col gap-4 border-t border-dashed border-richblack-600/30">
              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-richblack-300" : "text-richblack-600"
                    }`}
                  >
                    Progression
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      darkMode ? "text-yellow-50" : "text-blue-600"
                    }`}
                  >
                    {course.progressPercentage || 0}%
                  </p>
                </div>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                  bgColor={darkMode ? "#EAB308" : "#2563EB"}
                  baseBgColor={darkMode ? "#374151" : "#E5E7EB"}
                  borderRadius="4px"
                  transitionDuration="0.5s"
                  animateOnRender={true}
                />
              </div>

              {/* Mobile View - Quiz Button */}
              <div className="flex justify-center">
                {course.finalQuiz &&
                course.finalQuizDetails &&
                course.finalQuizDetails.publie === true &&
                course.progressPercentage === 100 ? (
                  <button
                    onClick={(e) =>
                      handleTakeQuiz(course._id, course.finalQuiz, e)
                    }
                    className={`flex items-center gap-x-2 rounded-xl ${
                      darkMode
                        ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                        : completedQuizzes[course.finalQuiz]
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-[#0a2f59] text-white hover:bg-blue-700"
                    } py-2.5 px-4 text-sm font-medium transition-all duration-300 hover:shadow-md w-full justify-center`}
                  >
                    {completedQuizzes[course.finalQuiz] ? (
                      <FaCheckCircle size={16} />
                    ) : (
                      <FaClipboard size={16} />
                    )}
                    {completedQuizzes[course.finalQuiz]
                      ? "Voir résultats"
                      : "Passer l'examen"}
                  </button>
                ) : course.finalQuiz &&
                  course.finalQuizDetails &&
                  course.finalQuizDetails.publie === true ? (
                  <span
                    className={`text-sm py-2 px-4 rounded-xl ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-400"
                        : "bg-gray-100 text-richblack-500"
                    }`}
                  >
                    Terminez la formation d'abord
                  </span>
                ) : course.finalQuiz && course.finalQuizDetails ? (
                  <span
                    className={`text-sm py-2 px-4 rounded-xl ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-400"
                        : "bg-gray-100 text-richblack-500"
                    }`}
                  >
                    Examen pas encore disponible
                  </span>
                ) : (
                  <span
                    className={`text-sm py-2 px-4 rounded-xl ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-400"
                        : "bg-gray-100 text-richblack-500"
                    }`}
                  >
                    Pas d'examen final
                  </span>
                )}
              </div>
            </div>

            {/* Desktop View */}
            {/* Duration */}
            <div
              className={`hidden w-1/4 sm:flex items-center px-4 py-5 ${
                darkMode ? "text-richblack-100" : "text-richblack-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen
                  className={darkMode ? "text-yellow-50" : "text-blue-600"}
                  size={18}
                />
                <span>{course?.totalDuration || "N/A"}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="hidden sm:flex w-1/5 flex-col gap-2 px-4 py-5">
              <div className="flex justify-between items-center">
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  {course.progressPercentage || 0}%
                </p>
              </div>
              <ProgressBar
                completed={course.progressPercentage || 0}
                height="8px"
                isLabelVisible={false}
                bgColor={darkMode ? "#EAB308" : "#2563EB"}
                baseBgColor={darkMode ? "#374151" : "#E5E7EB"}
                borderRadius="4px"
                transitionDuration="0.5s"
                animateOnRender={true}
              />
            </div>

            {/* Desktop View - Quiz Button */}
            <div className="hidden sm:flex w-1/6 px-4 py-5 justify-center items-center">
              {course.finalQuiz &&
              course.finalQuizDetails &&
              course.finalQuizDetails.publie === true &&
              course.progressPercentage === 100 ? (
                <button
                  onClick={(e) =>
                    handleTakeQuiz(course._id, course.finalQuiz, e)
                  }
                  className={`flex items-center gap-x-2 rounded-xl ${
                    darkMode
                      ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                      : completedQuizzes[course.finalQuiz]
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-[#0a2f59] text-white hover:bg-blue-700"
                  } py-2 px-4 text-sm font-medium transition-all duration-300 hover:shadow-md`}
                >
                  {completedQuizzes[course.finalQuiz] ? (
                    <FaCheckCircle size={14} />
                  ) : (
                    <FaClipboard size={14} />
                  )}
                  {completedQuizzes[course.finalQuiz] ? "Résultats" : "Examen"}
                </button>
              ) : course.finalQuiz &&
                course.finalQuizDetails &&
                course.finalQuizDetails.publie === true ? (
                <span
                  className={`text-xs py-2 px-3 rounded-xl ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-400"
                      : "bg-gray-100 text-richblack-500"
                  }`}
                >
                  Terminez la formation
                </span>
              ) : course.finalQuiz && course.finalQuizDetails ? (
                <span
                  className={`text-xs py-2 px-3 rounded-xl ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-400"
                      : "bg-gray-100 text-richblack-500"
                  }`}
                >
                  Pas encore disponible
                </span>
              ) : (
                <span
                  className={`text-xs py-2 px-3 rounded-xl ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-400"
                      : "bg-gray-100 text-richblack-500"
                  }`}
                >
                  Pas d'examen
                </span>
              )}
            </div>

            {/* Hover indicator */}
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                darkMode ? "text-yellow-50" : "text-blue-600"
              }`}
            >
              <FaChevronRight />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
