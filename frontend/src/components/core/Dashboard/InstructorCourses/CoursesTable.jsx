import { useDispatch, useSelector } from "react-redux";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { useState, useEffect } from "react";
import {
  FaCheck,
  FaSearch,
  FaCertificate,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import { FiEdit2, FiEye } from "react-icons/fi";
import { HiClock, HiOutlineFilter } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaClipboardQuestion } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { formatDate } from "../../../../services/formatDate";
import {
  deleteCourse,
  fetchInstructorCourses,
  getAllCourses,
} from "../../../../services/operations/courseDetailsAPI";
import { COURSE_STATUS } from "../../../../utils/constants";
import ConfirmationModal from "../../../common/ConfirmationModal";
import Img from "./../../../common/Img";
import toast from "react-hot-toast";

// Style CSS pour l'animation des lignes
const animationStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function CoursesTable({
  courses,
  setCourses,
  loading,
  setLoading,
  isAdmin = false,
}) {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.profile);

  const [confirmationModal, setConfirmationModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const TRUNCATE_LENGTH = 25;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Filter and sort courses
  const filteredCourses = courses
    ?.filter((course) => {
      // Apply search filter
      const matchesSearch =
        searchTerm === "" ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "draft" && course.status === COURSE_STATUS.DRAFT) ||
        (statusFilter === "published" &&
          course.status === COURSE_STATUS.PUBLISHED);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "a-z") {
        return a.courseName.localeCompare(b.courseName);
      } else if (sortBy === "z-a") {
        return b.courseName.localeCompare(a.courseName);
      }
      return 0;
    });

  // Pagination logic
  useEffect(() => {
    if (filteredCourses) {
      setTotalPages(Math.ceil(filteredCourses.length / itemsPerPage));

      // Reset to first page if current page is out of bounds
      if (
        currentPage > Math.ceil(filteredCourses.length / itemsPerPage) &&
        filteredCourses.length > 0
      ) {
        setCurrentPage(1);
      }
    }
  }, [filteredCourses, itemsPerPage]);

  // Get current courses for pagination
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = filteredCourses?.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  // delete course
  const handleCourseDelete = async (courseId) => {
    setLoading(true);
    const toastId = toast.loading("Suppression en cours...");
    await deleteCourse({ courseId: courseId }, token);

    // Rechargez les cours selon le type d'utilisateur
    let result;
    if (isAdmin) {
      result = await fetchInstructorCourses(token);
      if (result) setCourses(result);
    } else {
      result = await fetchInstructorCourses(token);
      if (result) setCourses(result);
    }

    setConfirmationModal(null);
    setActiveActionMenu(null);
    setLoading(false);
    toast.dismiss(toastId);
    toast.success("Cours supprimé avec succès");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setStatusFilter("all");
  };

  // Start Live Stream
  const startLiveStream = (courseId, courseName) => {
    navigate(`/dashboard/live-stream/${courseId}`);
    toast.success(`Démarrage du live stream pour ${courseName}`);
  };

  // Change page
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Toggle action menu for mobile view
  const toggleActionMenu = (courseId) => {
    setActiveActionMenu(activeActionMenu === courseId ? null : courseId);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeActionMenu && !event.target.closest(".action-menu-container")) {
        setActiveActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeActionMenu]);

  // Loading Skeleton
  const skItem = () => {
    return (
      <Tr>
        <Td colSpan={isAdmin ? "6" : "5"}>
          <div className="flex flex-1 gap-x-4 py-8">
            <div className="h-[148px] min-w-[300px] rounded-xl skeleton"></div>
            <div className="flex flex-col w-[40%]">
              <p className="h-5 w-[50%] rounded-xl skeleton"></p>
              <p className="h-20 w-[60%] rounded-xl mt-3 skeleton"></p>
              <p className="h-2 w-[20%] rounded-xl skeleton mt-3"></p>
              <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
            </div>
          </div>
        </Td>
      </Tr>
    );
  };

  // Mobile card view for a course
  const CourseCard = ({ course, index }) => {
    return (
      <div
        className={`p-4 rounded-lg mb-4 ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-richblack-100 shadow-sm"
        }`}
        style={{
          animation: `fadeIn 0.3s ease forwards ${index * 0.05}s`,
        }}
      >
        <div className="flex items-start gap-4">
          <div className="relative group w-24 h-24 flex-shrink-0">
            <Img
              src={course?.thumbnail}
              alt={course?.courseName}
              className="w-24 h-24 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => navigate(`/courses/${course._id}`)}
                className="bg-white bg-opacity-90 text-richblack-800 p-2 rounded-full"
              >
                <FiEye size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3
                className={`text-lg font-semibold capitalize ${
                  darkMode ? "text-richblack-5" : "text-richblack-800"
                }`}
              >
                {course.courseName}
              </h3>

              <div className="relative action-menu-container">
                <button
                  onClick={() => toggleActionMenu(course._id)}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "text-richblack-300 hover:bg-richblack-700"
                      : "text-richblack-500 hover:bg-richblack-50"
                  }`}
                >
                  <FaEllipsisV size={16} />
                </button>

                {activeActionMenu === course._id && (
                  <div
                    className={`absolute right-0 top-full mt-1 z-10 w-48 rounded-md shadow-lg ${
                      darkMode
                        ? "bg-richblack-700 border-richblack-600"
                        : "bg-white border-richblack-100"
                    } border`}
                  >
                    <div className="py-1">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/edit-course/${course._id}`)
                        }
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          darkMode
                            ? "text-richblack-100 hover:bg-richblack-600"
                            : "text-richblack-700 hover:bg-richblack-50"
                        }`}
                      >
                        <FiEdit2 className="mr-2" size={16} />
                        Modifier
                      </button>

                      {course.isCertified && (
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/course/${course._id}/certificates`
                            )
                          }
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            darkMode
                              ? "text-richblack-100 hover:bg-richblack-600"
                              : "text-richblack-700 hover:bg-richblack-50"
                          }`}
                        >
                          <FaCertificate className="mr-2" size={16} />
                          Certificats
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (course.finalQuiz) {
                            navigate(
                              `/dashboard/quiz/${course.finalQuiz}/edit`
                            );
                          } else {
                            navigate(
                              `/dashboard/course/${course._id}/create-quiz`
                            );
                          }
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          darkMode
                            ? "text-richblack-100 hover:bg-richblack-600"
                            : "text-richblack-700 hover:bg-richblack-50"
                        }`}
                      >
                        <FaClipboardQuestion className="mr-2" size={16} />
                        {course.finalQuiz
                          ? "Modifier l'examen"
                          : "Créer un examen"}
                      </button>

                      {!isAdmin && (
                        <button
                          onClick={() =>
                            startLiveStream(course._id, course.courseName)
                          }
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            darkMode
                              ? "text-richblack-100 hover:bg-richblack-600"
                              : "text-richblack-700 hover:bg-richblack-50"
                          }`}
                        >
                          <FaVideo className="mr-2" size={16} />
                          Démarrer un live
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setConfirmationModal({
                            text1: "Voulez-vous supprimer ce cours ?",
                            text2:
                              "Toutes les données liées à ce cours seront supprimées",
                            btn1Text: !loading ? "Supprimer" : "Chargement...",
                            btn2Text: "Annuler",
                            btn1Handler: !loading
                              ? () => handleCourseDelete(course._id)
                              : () => {},
                            btn2Handler: !loading
                              ? () => setConfirmationModal(null)
                              : () => {},
                          });
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          darkMode
                            ? "text-pink-200 hover:bg-richblack-600"
                            : "text-red-600 hover:bg-richblack-50"
                        }`}
                      >
                        <RiDeleteBin6Line className="mr-2" size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p
              className={`text-xs mt-1 ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                ? course.courseDescription
                    .split(" ")
                    .slice(0, TRUNCATE_LENGTH)
                    .join(" ") + "..."
                : course.courseDescription}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {course.status === COURSE_STATUS.DRAFT ? (
                <p
                  className={`flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                    darkMode
                      ? "bg-richblack-700 text-pink-100"
                      : "bg-pink-50 text-pink-600"
                  }`}
                >
                  <HiClock size={12} />
                  Brouillon
                </p>
              ) : (
                <p
                  className={`flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                    darkMode
                      ? "bg-richblack-700 text-blue-100"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <FaCheck size={10} />
                  Publié
                </p>
              )}

              {course.isCertified && (
                <p
                  className={`flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                    darkMode
                      ? "bg-green-900/20 text-green-300"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  <FaCertificate size={12} />
                  Certifiant
                </p>
              )}
            </div>

            {isAdmin && (
              <div className="mt-2 flex items-center">
                <span
                  className={`text-xs ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Instructeur:
                </span>
                <div className="flex items-center ml-2">
                  {course.instructor?.image && (
                    <img
                      src={course.instructor?.image}
                      alt={course.instructor?.firstName}
                      className="w-5 h-5 rounded-full mr-1 object-cover"
                    />
                  )}
                  <span
                    className={`text-xs ${
                      darkMode ? "text-richblack-200" : "text-richblack-600"
                    }`}
                  >
                    {course.instructor?._id === user?._id
                      ? "Vous (Admin)"
                      : `${course.instructor?.firstName || ""} ${
                          course.instructor?.lastName || ""
                        }`}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-between items-center">
              <p
                className={`text-xs ${
                  darkMode ? "text-richblack-400" : "text-richblack-500"
                }`}
              >
                Mis à jour: {formatDate(course?.updatedAt)}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-richblack-300" : "text-richblack-600"
                }`}
              >
                {course?.totalDuration || "2hr 30min"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Style pour l'animation */}
      <style>{animationStyle}</style>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
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
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-richblack-5 text-richblack-800 border-richblack-200"
              } focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
              }`}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
            } transition-all`}
          >
            <HiOutlineFilter />
            <span>Filtres</span>
            {(statusFilter !== "all" || sortBy !== "newest") && (
              <span
                className={`ml-2 w-2 h-2 rounded-full ${
                  darkMode ? "bg-blue-100" : "bg-blue-600"
                }`}
              ></span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`mt-4 p-4 rounded-lg overflow-hidden ${
              darkMode
                ? "bg-richblack-800"
                : "bg-white border border-richblack-100"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full p-2 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } border`}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
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
                  className={`w-full p-2 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } border`}
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                </select>
              </div>

              {/* Items per page */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  Éléments par page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={`w-full p-2 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } border`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                      : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
                  }`}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : currentCourses?.length === 0 ? (
          <div
            className={`py-10 text-center text-xl font-medium ${
              darkMode ? "text-richblack-100" : "text-richblack-600"
            }`}
          >
            {searchTerm || statusFilter !== "all"
              ? "Aucun cours ne correspond à vos critères"
              : "Aucun cours trouvé"}
          </div>
        ) : (
          currentCourses?.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block">
        <div
          className={`rounded-xl overflow-hidden ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white shadow-md"
          }`}
        >
          <Table className="w-full">
            <Thead>
              <Tr
                className={`flex gap-x-10 px-6 py-3 ${
                  darkMode
                    ? "bg-richblack-700 border-b border-richblack-600"
                    : "bg-richblack-50 border-b border-richblack-200"
                }`}
              >
                <Th
                  className={`flex-1 text-left text-sm font-medium uppercase ${
                    darkMode ? "text-richblack-100" : "text-richblack-700"
                  }`}
                >
                  Formations
                </Th>

                {/* Colonne d'instructeur uniquement pour les admins */}
                {isAdmin && (
                  <Th
                    className={`text-left text-sm font-medium uppercase ${
                      darkMode ? "text-richblack-100" : "text-richblack-700"
                    }`}
                  >
                    Instructeur
                  </Th>
                )}

                <Th
                  className={`text-left text-sm font-medium uppercase ${
                    darkMode ? "text-richblack-100" : "text-richblack-700"
                  }`}
                >
                  Durée
                </Th>
                <Th
                  className={`text-left text-sm font-medium uppercase ${
                    darkMode ? "text-richblack-100" : "text-richblack-700"
                  }`}
                >
                  Actions
                </Th>
                <Th
                  className={`text-left text-sm font-medium uppercase ${
                    darkMode ? "text-richblack-100" : "text-richblack-700"
                  }`}
                >
                  Examen
                </Th>

                {!isAdmin && (
                  <Th
                    className={`text-left text-sm font-medium uppercase ${
                      darkMode ? "text-richblack-100" : "text-richblack-700"
                    }`}
                  >
                    Live
                  </Th>
                )}
              </Tr>
            </Thead>

            {/* Loading Skeleton */}
            {loading && (
              <Tbody>
                {skItem()}
                {skItem()}
                {skItem()}
              </Tbody>
            )}

            <Tbody>
              {!loading && currentCourses?.length === 0 ? (
                <Tr>
                  <Td
                    className={`py-10 text-center text-xl font-medium ${
                      darkMode ? "text-richblack-100" : "text-richblack-600"
                    }`}
                    colSpan={isAdmin ? "6" : "5"}
                  >
                    {searchTerm || statusFilter !== "all"
                      ? "Aucun cours ne correspond à vos critères"
                      : "Aucun cours trouvé"}
                  </Td>
                </Tr>
              ) : (
                currentCourses?.map((course, index) => (
                  <Tr
                    key={course._id}
                    className={`flex gap-x-10 border-b px-6 py-6 ${
                      darkMode
                        ? "border-richblack-700 hover:bg-richblack-700"
                        : "border-richblack-100 hover:bg-richblack-50"
                    } transition-colors`}
                    style={{
                      animation: `fadeIn 0.3s ease forwards ${index * 0.05}s`,
                    }}
                  >
                    <Td className="flex flex-1 gap-x-4 relative">
                      <div className="relative group">
                        <Img
                          src={course?.thumbnail}
                          alt={course?.courseName}
                          className="h-[120px] min-w-[200px] max-w-[200px] rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="bg-white bg-opacity-90 text-richblack-800 p-2 rounded-full"
                          >
                            <FiEye size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p
                          className={`text-lg font-semibold capitalize ${
                            darkMode ? "text-richblack-5" : "text-richblack-800"
                          }`}
                        >
                          {course.courseName}
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode
                              ? "text-richblack-300"
                              : "text-richblack-600"
                          }`}
                        >
                          {course.courseDescription.split(" ").length >
                          TRUNCATE_LENGTH
                            ? course.courseDescription
                                .split(" ")
                                .slice(0, TRUNCATE_LENGTH)
                                .join(" ") + "..."
                            : course.courseDescription}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                          <p
                            className={`text-[12px] ${
                              darkMode
                                ? "text-richblack-300"
                                : "text-richblack-500"
                            }`}
                          >
                            Créé le: {formatDate(course?.createdAt)}
                          </p>
                          <p
                            className={`text-[12px] ${
                              darkMode
                                ? "text-richblack-300"
                                : "text-richblack-500"
                            }`}
                          >
                            Mis à jour: {formatDate(course?.updatedAt)}
                          </p>
                        </div>
                        {course.status === COURSE_STATUS.DRAFT ? (
                          <p
                            className={`mt-2 flex w-fit flex-row items-center gap-2 rounded-full ${
                              darkMode ? "bg-richblack-700" : "bg-pink-50"
                            } px-2 py-[2px] text-[12px] font-medium ${
                              darkMode ? "text-pink-100" : "text-pink-600"
                            }`}
                          >
                            <HiClock size={14} />
                            Brouillon
                          </p>
                        ) : (
                          <div
                            className={`mt-2 flex w-fit flex-row items-center gap-2 rounded-full ${
                              darkMode ? "bg-richblack-700" : "bg-blue-50"
                            } px-2 py-[2px] text-[12px] font-medium ${
                              darkMode ? "text-blue-100" : "text-blue-600"
                            }`}
                          >
                            <p
                              className={`flex h-3 w-3 items-center justify-center rounded-full ${
                                darkMode
                                  ? "bg-blue-200 text-richblack-700"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              <FaCheck size={8} />
                            </p>
                            Publié
                          </div>
                        )}
                        {course.isCertified && (
                          <div
                            className={`mt-2 flex w-fit flex-row items-center gap-2 rounded-full ${
                              darkMode ? "bg-green-900/20" : "bg-green-50"
                            } px-2 py-[2px] text-[12px] font-medium ${
                              darkMode ? "text-green-300" : "text-green-600"
                            }`}
                          >
                            <FaCertificate size={12} />
                            Certifiant
                          </div>
                        )}
                      </div>
                    </Td>

                    {/* Afficher la colonne d'instructeur pour l'admin */}
                    {isAdmin && (
                      <Td
                        className={`text-sm font-medium ${
                          darkMode ? "text-richblack-100" : "text-richblack-600"
                        }`}
                      >
                        <div className="flex items-center">
                          {course.instructor?.image && (
                            <img
                              src={course.instructor?.image}
                              alt={course.instructor?.firstName}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          )}
                          <span>
                            {course.instructor?._id === user?._id ? (
                              <span className="flex items-center gap-1">
                                Vous (Admin)
                                <span className="bg-yellow-500 text-xs text-black px-1 rounded">
                                  Admin
                                </span>
                              </span>
                            ) : (
                              `${course.instructor?.firstName || ""} ${
                                course.instructor?.lastName || ""
                              }`
                            )}
                          </span>
                        </div>
                      </Td>
                    )}

                    <Td
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-richblack-600"
                      }`}
                    >
                      {course?.totalDuration || "2hr 30min"}
                    </Td>
                    <Td
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-richblack-600"
                      }`}
                    >
                      <div className="flex gap-2">
                        <button
                          disabled={loading}
                          onClick={() =>
                            navigate(`/dashboard/edit-course/${course._id}`)
                          }
                          title="Modifier"
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? "bg-richblack-700 text-yellow-50 hover:bg-yellow-900/30"
                              : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          }`}
                        >
                          <FiEdit2 size={18} />
                        </button>

                        {/* Bouton pour les certificats - s'affiche uniquement si le cours est certifiant */}
                        {course.isCertified && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              navigate(
                                `/dashboard/course/${course._id}/certificates`
                              )
                            }
                            title="Gérer les certificats"
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              darkMode
                                ? "bg-richblack-700 text-green-300 hover:bg-green-900/30"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            <FaCertificate size={18} />
                          </button>
                        )}

                        <button
                          disabled={loading}
                          onClick={() => {
                            setConfirmationModal({
                              text1: "Voulez-vous supprimer ce cours ?",
                              text2:
                                "Toutes les données liées à ce cours seront supprimées",
                              btn1Text: !loading
                                ? "Supprimer"
                                : "Chargement...",
                              btn2Text: "Annuler",
                              btn1Handler: !loading
                                ? () => handleCourseDelete(course._id)
                                : () => {},
                              btn2Handler: !loading
                                ? () => setConfirmationModal(null)
                                : () => {},
                            });
                          }}
                          title="Supprimer"
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? "bg-richblack-700 text-pink-200 hover:bg-pink-900/30"
                              : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                          }`}
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>
                      </div>
                    </Td>
                    <Td
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-richblack-600"
                      }`}
                    >
                      <button
                        disabled={loading}
                        onClick={() => {
                          if (course.finalQuiz) {
                            navigate(
                              `/dashboard/quiz/${course.finalQuiz}/edit`
                            );
                          } else {
                            navigate(
                              `/dashboard/course/${course._id}/create-quiz`
                            );
                          }
                        }}
                        title={
                          course.finalQuiz
                            ? "Modifier l'examen"
                            : "Créer un examen"
                        }
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          darkMode
                            ? "bg-richblack-700 text-blue-300 hover:bg-blue-900/30"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        <FaClipboardQuestion size={18} />
                      </button>
                    </Td>
                    {!isAdmin && (
                      <Td
                        className={`text-sm font-medium ${
                          darkMode ? "text-richblack-100" : "text-richblack-600"
                        }`}
                      >
                        <button
                          disabled={loading}
                          onClick={() =>
                            startLiveStream(course._id, course.courseName)
                          }
                          title="Démarrer un live stream"
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            darkMode
                              ? "bg-richblack-700 text-red-300 hover:bg-red-900/30"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          <FaVideo size={18} />
                        </button>
                      </Td>
                    )}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
            {Math.min(currentPage * itemsPerPage, filteredCourses.length)} sur{" "}
            {filteredCourses.length} cours
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-500 hover:text-white"
              } ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logique pour afficher les pages autour de la page courante
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === pageNum
                      ? "bg-yellow-500 text-white"
                      : darkMode
                      ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-500 hover:text-white"
              } ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
