import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaFileImport,
  FaFilePdf,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaGraduationCap,
  FaFilter,
  FaDownload,
  FaUpload,
  FaBookOpen,
  FaUsers,
} from "react-icons/fa";
import { MdFilterList, MdOutlineFilterAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../../common/ConfirmationModal";
import IconBtn from "../../../common/IconBtn";
import { apiConnector } from "../../../../services/apiConnector";
import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";
import {
  enrollStudentToCourse,
  enrollMultipleStudentsToCourse,
} from "../../../../services/operations/studentFeaturesAPI";
import {
  getUsersByType,
  deleteUser,
  exportUsersToPDF,
} from "../../../../services/operations/adminAPI";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// Composant Modal pour inscrire un étudiant à des cours
const EnrollStudentModal = ({ student, isOpen, onClose }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getAllCourses();
        // Filtrer les cours auxquels l'étudiant n'est pas déjà inscrit
        const filteredCourses = response.filter(
          (course) => !course.studentsEnrolled?.includes(student._id)
        );
        setAvailableCourses(filteredCourses);
      } catch (error) {
        console.error("Erreur lors de la récupération des formations:", error);
        toast.error("Impossible de charger les formations");
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen, student._id]);

  const handleEnroll = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Veuillez sélectionner au moins une formation");
      return;
    }

    setLoading(true);
    try {
      const result = await enrollStudentToCourse(
        student._id,
        selectedCourses,
        token
      );
      if (result.success) {
        toast.success(
          `${student.firstName} ${student.lastName} inscrit(e) avec succès à ${selectedCourses.length} formations`
        );
        onClose(true); // Passer true pour indiquer que l'inscription a réussi
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => onClose(false)}
      />
      <div
        className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Inscrire {student.firstName} {student.lastName} à des formations
        </h2>

        {loading && availableCourses.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : availableCourses.length === 0 ? (
          <p
            className={`text-center py-8 ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Aucun formation disponible pour cet apprenant
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto mb-4">
            {availableCourses.map((course) => (
              <label
                key={course._id}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${
                  darkMode ? "hover:bg-richblack-700" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="mr-3"
                  checked={selectedCourses.includes(course._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCourses([...selectedCourses, course._id]);
                    } else {
                      setSelectedCourses(
                        selectedCourses.filter((id) => id !== course._id)
                      );
                    }
                  }}
                />
                <div>
                  <p
                    className={`font-medium ${
                      darkMode ? "text-richblack-5" : "text-richblack-800"
                    }`}
                  >
                    {course.courseName}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-richblack-600"
                    }`}
                  >
                    {course.courseDescription?.substring(0, 60)}
                    {course.courseDescription?.length > 60 ? "..." : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onClose(false)}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Annuler
          </button>
          <button
            onClick={handleEnroll}
            disabled={loading || selectedCourses.length === 0}
            className={`px-4 py-2 rounded-lg ${
              loading || selectedCourses.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-yellow-600"
            } bg-yellow-500 text-white`}
          >
            {loading ? "Inscription..." : "Inscrire"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Composant Modal pour inscrire plusieurs étudiants à un cours
const EnrollMultipleStudentsModal = ({ students, isOpen, onClose }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getAllCourses();
        setAvailableCourses(response);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
        toast.error("Impossible de charger les formations");
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Veuillez sélectionner au moins un apprenant");
      return;
    }

    if (!selectedCourse) {
      toast.error("Veuillez sélectionner une formation");
      return;
    }

    setLoading(true);
    try {
      const result = await enrollMultipleStudentsToCourse(
        selectedStudents,
        selectedCourse,
        token
      );
      if (result.success) {
        toast.success(
          `${selectedStudents.length} apprenants inscrits avec succès`
        );
        onClose(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription multiple:", error);
      toast.error("Erreur lors de l'inscription multiple");
    }
    setLoading(false);
  };

  // Filtrer les étudiants en fonction du terme de recherche
  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => onClose(false)}
      />
      <div
        className={`relative w-full max-w-3xl p-6 rounded-lg shadow-xl ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Inscrire plusieurs apprenants à une formation
        </h2>

        {/* Sélection du cours */}
        <div className="mb-6">
          <label
            className={`block mb-2 font-medium ${
              darkMode ? "text-richblack-100" : "text-richblack-700"
            }`}
          >
            Sélectionner une formation
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={`w-full p-3 rounded-lg ${
              darkMode
                ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                : "bg-white text-gray-800 border-gray-300"
            } border focus:outline-none focus:ring-2 ${
              darkMode ? "focus:ring-yellow-500/50" : "focus:ring-yellow-500/50"
            }`}
          >
            <option value="">Sélectionner une formation</option>
            {availableCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Recherche d'étudiants */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un apprenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg w-full ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-white text-gray-800 border-gray-300"
              } border focus:outline-none focus:ring-2 ${
                darkMode
                  ? "focus:ring-yellow-500/50"
                  : "focus:ring-yellow-500/50"
              } transition-all duration-200`}
            />
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Liste des étudiants */}
        <div className="max-h-60 overflow-y-auto mb-4">
          <div className="flex items-center mb-2 px-3">
            <input
              type="checkbox"
              className="mr-3"
              checked={
                selectedStudents.length === filteredStudents.length &&
                filteredStudents.length > 0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedStudents(
                    filteredStudents.map((student) => student._id)
                  );
                } else {
                  setSelectedStudents([]);
                }
              }}
            />
            <span
              className={`font-medium ${
                darkMode ? "text-richblack-100" : "text-richblack-700"
              }`}
            >
              Sélectionner tous ({filteredStudents.length})
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <p
              className={`text-center py-4 ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Aucun apprenant trouvé
            </p>
          ) : (
            filteredStudents.map((student) => (
              <label
                key={student._id}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${
                  darkMode ? "hover:bg-richblack-700" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="mr-3"
                  checked={selectedStudents.includes(student._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, student._id]);
                    } else {
                      setSelectedStudents(
                        selectedStudents.filter((id) => id !== student._id)
                      );
                    }
                  }}
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    <img
                      src={
                        student.image ||
                        `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}`
                      }
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-richblack-5" : "text-richblack-800"
                      }`}
                    >
                      {student.firstName} {student.lastName}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-richblack-300" : "text-richblack-600"
                      }`}
                    >
                      {student.email}
                    </p>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-between items-center">
          <div
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            {selectedStudents.length} apprenant(s) sélectionné(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onClose(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleEnroll}
              disabled={
                loading || selectedStudents.length === 0 || !selectedCourse
              }
              className={`px-4 py-2 rounded-lg ${
                loading || selectedStudents.length === 0 || !selectedCourse
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-600"
              } bg-yellow-500 text-white`}
            >
              {loading ? "Inscription..." : "Inscrire"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function StudentManagement() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const fileInputRef = useRef(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [enrollmentModalStudent, setEnrollmentModalStudent] = useState(null);
  const [showMultipleEnrollmentModal, setShowMultipleEnrollmentModal] =
    useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  // Dans votre composant StudentManagement
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchStudentStats = async () => {
    try {
      const response = await apiConnector(
        "GET",
        `${BASE_URL}/admin/student-stats`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  // Appeler cette fonction au chargement du composant
  useEffect(() => {
    fetchStudentStats();
  }, []);

  // Récupérer les étudiants avec pagination côté serveur
  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/admin/users?accountType=Student&page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&sortField=${sortField}&sortDirection=${sortDirection}`;

      // Ajouter le filtre de statut si nécessaire
      if (statusFilter !== "all") {
        url += `&statusFilter=${statusFilter}`;
      }

      const response = await apiConnector("GET", url, null, {
        Authorization: `Bearer ${token}`,
      });

      if (response?.data?.success) {
        const studentsData = response.data.data || [];
        setStudents(studentsData);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error("Erreur API:", response?.data);
        toast.error("Impossible de charger les apprenants");
        setStudents([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des apprenants:", error);
      toast.error("Impossible de charger les apprenants");
      setStudents([]);
    }
    setLoading(false);
  };

  // Appeler fetchStudents lorsque les paramètres changent
  useEffect(() => {
    fetchStudents();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    statusFilter,
  ]);

  // Supprimer un étudiant
  const handleDeleteStudent = async (studentId) => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "DELETE",
        `${BASE_URL}/admin/users/${studentId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Apprenant supprimé avec succès");
        fetchStudents();
        fetchStudentStats(); // Mettre à jour les statistiques après suppression
      } else {
        toast.error("Erreur lors de la suppression de l'apprenant");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'apprenant:", error);
      toast.error("Erreur lors de la suppression de l'apprenant");
    }
    setLoading(false);
    setConfirmationModal(null);
    setActiveActionMenu(null);
  };

  // Fonction pour gérer le tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fonction pour gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Fonction pour changer de page
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fonction pour changer le nombre d'éléments par page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Fermer le menu d'actions lorsqu'on clique ailleurs
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

  // Fonction pour gérer l'import CSV
  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        `${BASE_URL}/admin/users/import-csv`,
        formData,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      );

      if (response?.data?.success) {
        toast.success("Utilisateurs importés avec succès");
        fetchStudents();
        fetchStudentStats(); // Mettre à jour les statistiques après import
      } else {
        toast.error("Erreur lors de l'importation des utilisateurs");
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      toast.error("Erreur lors de l'importation des utilisateurs");
    }
    setLoading(false);
  };

  // Fonction pour gérer l'export PDF
  const handleExportPDF = async () => {
    const toastId = toast.loading("Génération du PDF...");
    try {
      await exportUsersToPDF(token, "Student"); // Spécifier "Student" comme accountType
      toast.success("PDF des apprenants généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Fonction pour afficher l'icône de tri appropriée
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Fonction pour basculer le menu d'actions
  const toggleActionMenu = (studentId) => {
    setActiveActionMenu(activeActionMenu === studentId ? null : studentId);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // Gérer la fermeture du modal d'inscription
  const handleEnrollmentModalClose = (success) => {
    setEnrollmentModalStudent(null);
    if (success) {
      fetchStudents();
    }
  };

  // Gérer l'ouverture du modal d'inscription multiple
  const handleOpenMultipleEnrollmentModal = async () => {
    setLoading(true);
    try {
      // Faire une requête pour obtenir tous les étudiants actifs
      const response = await apiConnector(
        "GET",
        `${BASE_URL}/admin/users?accountType=Student&statusFilter=active&limit=1000`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        const activeStudents = response.data.data || [];
        setAllStudents(activeStudents);
        setShowMultipleEnrollmentModal(true);
      } else {
        toast.error("Impossible de charger les apprenants actifs");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des apprenants actifs:",
        error
      );
      toast.error("Impossible de charger les apprenants actifs");
    }
    setLoading(false);
  };

  // Gérer la fermeture du modal d'inscription multiple
  const handleMultipleEnrollmentModalClose = (success) => {
    setShowMultipleEnrollmentModal(false);
    if (success) {
      fetchStudents();
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col gap-6"
    >
      {/* En-tête avec titre et boutons d'action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-transparent to-transparent via-transparent p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${
              darkMode ? "bg-richblack-700" : "bg-blue-100"
            }`}
          >
            <FaGraduationCap
              className={`text-xl ${
                darkMode ? "text-yellow-50" : "text-blue-600"
              }`}
            />
          </div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Gestion des Apprenants
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden"
          />
          <IconBtn
            text="Importer CSV"
            onClick={() => fileInputRef.current.click()}
            variant="secondary"
            size="medium"
          >
            <FaUpload />
          </IconBtn>
          <IconBtn
            text="Exporter PDF"
            onClick={handleExportPDF}
            variant="secondary"
            size="medium"
          >
            <FaDownload />
          </IconBtn>
          <IconBtn
            text="Inscription multiple"
            onClick={handleOpenMultipleEnrollmentModal}
            variant="secondary"
            size="medium"
          >
            <FaUsers />
          </IconBtn>
          <Link to="/dashboard/add-student">
            <IconBtn
              text="Ajouter un apprenant"
              variant="primary"
              size="medium"
            >
              <FaUserPlus />
            </IconBtn>
          </Link>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div
        className={`p-4 rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Rechercher un apprenant..."
              value={searchTerm}
              onChange={handleSearch}
              className={`pl-10 pr-4 py-3 rounded-lg w-full sm:w-64 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-white text-gray-800 border-gray-300"
              } border focus:outline-none focus:ring-2 ${
                darkMode
                  ? "focus:ring-yellow-500/50"
                  : "focus:ring-yellow-500/50"
              } transition-all duration-200`}
            />
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-all duration-200`}
            >
              <MdOutlineFilterAlt className="text-lg" />
              <span>Filtres</span>
              {showFilters ? <FaSortUp /> : <FaSortDown />}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label
                className={`text-sm ${
                  darkMode ? "text-richblack-300" : "text-gray-600"
                }`}
              >
                Afficher
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className={`rounded-lg px-3 py-2 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-white text-gray-800 border-gray-300"
                } border focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span
                className={`text-sm ${
                  darkMode ? "text-richblack-300" : "text-gray-600"
                }`}
              >
                par page
              </span>
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={`p-4 rounded-lg mt-2 ${
                  darkMode ? "bg-richblack-700" : "bg-gray-50"
                }`}
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Statut
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          statusFilter === "all"
                            ? darkMode
                              ? "bg-yellow-50 text-richblack-900"
                              : "bg-yellow-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          statusFilter === "active"
                            ? darkMode
                              ? "bg-green-500 text-white"
                              : "bg-green-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Actifs
                      </button>
                      <button
                        onClick={() => setStatusFilter("inactive")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          statusFilter === "inactive"
                            ? darkMode
                              ? "bg-red-500 text-white"
                              : "bg-red-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Inactifs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des étudiants */}
      <div
        className={`rounded-xl overflow-hidden ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
            <p className={darkMode ? "text-richblack-300" : "text-gray-500"}>
              Chargement des apprenants...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className={`p-4 rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-gray-100"
              } mb-4`}
            >
              <FaGraduationCap
                className={`text-4xl ${
                  darkMode ? "text-richblack-400" : "text-gray-400"
                }`}
              />
            </div>
            <p
              className={`text-center text-lg font-medium ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Aucun apprenant trouvé
            </p>
            <p
              className={`text-center text-sm mt-2 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            >
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Ajoutez des apprenants pour commencer"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-all duration-200`}
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Version desktop du tableau */}
            <table className="w-full border-collapse hidden md:table">
              <thead>
                <tr className={darkMode ? "bg-richblack-700" : "bg-gray-50"}>
                  <th
                    className={`p-4 text-left ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    } cursor-pointer`}
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center gap-2">
                      Nom {renderSortIcon("firstName")}
                    </div>
                  </th>
                  <th
                    className={`p-4 text-left ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    } cursor-pointer`}
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email {renderSortIcon("email")}
                    </div>
                  </th>
                  <th
                    className={`p-4 text-left ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    } cursor-pointer`}
                    onClick={() => handleSort("active")}
                  >
                    <div className="flex items-center gap-2">
                      Statut {renderSortIcon("active")}
                    </div>
                  </th>
                  <th
                    className={`p-4 text-left ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student._id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={tableRowVariants}
                      className={`border-b ${
                        darkMode
                          ? "border-richblack-700 hover:bg-richblack-700"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500">
                            <img
                              src={
                                student.image ||
                                "https://ui-avatars.com/api/?name=" +
                                  student.firstName +
                                  "+" +
                                  student.lastName
                              }
                              alt={student.firstName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span
                              className={`font-medium ${
                                darkMode ? "text-richblack-5" : "text-gray-800"
                              }`}
                            >
                              {student.firstName} {student.lastName}
                            </span>
                            {student.contactNumber && (
                              <p
                                className={`text-xs ${
                                  darkMode
                                    ? "text-richblack-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {student.contactNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`p-4 ${
                          darkMode ? "text-richblack-300" : "text-gray-600"
                        }`}
                      >
                        {student.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            student.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setEnrollmentModalStudent(student)}
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-richblack-700 text-green-400 hover:bg-richblack-600"
                                : "bg-gray-100 text-green-600 hover:bg-gray-200"
                            } transition-all duration-200`}
                            title="Inscrire à des formations"
                          >
                            <FaBookOpen size={16} />
                          </button>
                          <Link to={`/dashboard/edit-student/${student._id}`}>
                            <button
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-richblack-700 text-yellow-50 hover:bg-richblack-600"
                                  : "bg-gray-100 text-yellow-500 hover:bg-gray-200"
                              } transition-all duration-200`}
                              title="Modifier"
                            >
                              <FaEdit size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              setConfirmationModal({
                                text1: "Êtes-vous sûr ?",
                                text2:
                                  "Cet apprenant sera supprimé définitivement",
                                btn1Text: "Supprimer",
                                btn2Text: "Annuler",
                                btn1Handler: () =>
                                  handleDeleteStudent(student._id),
                                btn2Handler: () => setConfirmationModal(null),
                              })
                            }
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-richblack-700 text-pink-200 hover:bg-richblack-600"
                                : "bg-gray-100 text-red-500 hover:bg-gray-200"
                            } transition-all duration-200`}
                            title="Supprimer"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Version mobile - cartes */}
            <div className="md:hidden space-y-4 p-4">
              <AnimatePresence>
                {students.map((student, index) => (
                  <motion.div
                    key={student._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tableRowVariants}
                    className={`p-4 rounded-lg ${
                      darkMode
                        ? "bg-richblack-700 border border-richblack-600"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500">
                          <img
                            src={
                              student.image ||
                              "https://ui-avatars.com/api/?name=" +
                                student.firstName +
                                "+" +
                                student.lastName
                            }
                            alt={student.firstName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3
                            className={`font-medium ${
                              darkMode ? "text-richblack-5" : "text-gray-800"
                            }`}
                          >
                            {student.firstName} {student.lastName}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-richblack-300" : "text-gray-600"
                            }`}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="relative action-menu-container">
                        <button
                          onClick={() => toggleActionMenu(student._id)}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? "bg-richblack-800 text-richblack-300 hover:bg-richblack-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } transition-all duration-200`}
                        >
                          <FaEllipsisV />
                        </button>
                        <AnimatePresence>
                          {activeActionMenu === student._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${
                                darkMode ? "bg-richblack-800" : "bg-white"
                              } border ${
                                darkMode
                                  ? "border-richblack-600"
                                  : "border-gray-200"
                              } overflow-hidden`}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setEnrollmentModalStudent(student);
                                    setActiveActionMenu(null);
                                  }}
                                  className={`flex items-center w-full text-left px-4 py-3 text-sm ${
                                    darkMode
                                      ? "text-green-400 hover:bg-richblack-700"
                                      : "text-green-600 hover:bg-gray-100"
                                  }`}
                                >
                                  <FaBookOpen className="mr-3" /> Inscrire à des
                                  formations
                                </button>
                                <Link
                                  to={`/dashboard/edit-student/${student._id}`}
                                  className={`flex items-center px-4 py-3 text-sm ${
                                    darkMode
                                      ? "text-richblack-100 hover:bg-richblack-700"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <FaEdit className="mr-3 text-yellow-500" />{" "}
                                  Modifier
                                </Link>
                                <button
                                  onClick={() =>
                                    setConfirmationModal({
                                      text1: "Êtes-vous sûr ?",
                                      text2:
                                        "Cet apprenant sera supprimé définitivement",
                                      btn1Text: "Supprimer",
                                      btn2Text: "Annuler",
                                      btn1Handler: () =>
                                        handleDeleteStudent(student._id),
                                      btn2Handler: () =>
                                        setConfirmationModal(null),
                                    })
                                  }
                                  className={`flex items-center w-full text-left px-4 py-3 text-sm ${
                                    darkMode
                                      ? "text-pink-200 hover:bg-richblack-700"
                                      : "text-red-500 hover:bg-gray-100"
                                  }`}
                                >
                                  <FaTrash className="mr-3" /> Supprimer
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.active ? "Actif" : "Inactif"}
                      </span>
                      {student.contactNumber && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            darkMode
                              ? "bg-richblack-600 text-richblack-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.contactNumber}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <div
            className={`text-sm text-center sm:text-left ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Affichage de{" "}
            <span className="font-medium">
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            </span>{" "}
            à{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            sur <span className="font-medium">{totalItems}</span> apprenants
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-500 hover:text-white"
              } ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100"
                  : "bg-gray-100 text-gray-700"
              } transition-all duration-200`}
              aria-label="Page précédente"
            >
              <FaChevronLeft size={16} />
            </button>

            <div className="hidden sm:flex gap-2">
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
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentPage === pageNum
                        ? darkMode
                          ? "bg-yellow-500 text-white"
                          : "bg-yellow-500 text-white"
                        : darkMode
                        ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-all duration-200`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-100"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {currentPage} / {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-500 hover:text-white"
              } ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100"
                  : "bg-gray-100 text-gray-700"
              } transition-all duration-200`}
              aria-label="Page suivante"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div
        className={`p-4 rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}
              >
                <FaGraduationCap
                  className={`text-xl ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Total des apprenants
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-green-900/30" : "bg-green-100"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full ${
                    darkMode ? "bg-green-500" : "bg-green-500"
                  }`}
                ></div>
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Apprenants actifs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-red-900/30" : "bg-red-100"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full ${
                    darkMode ? "bg-red-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Apprenants inactifs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {confirmationModal && (
          <ConfirmationModal modalData={confirmationModal} />
        )}
      </AnimatePresence>

      {/* Modal d'inscription d'un étudiant à des cours */}
      <AnimatePresence>
        {enrollmentModalStudent && (
          <EnrollStudentModal
            student={enrollmentModalStudent}
            isOpen={true}
            onClose={handleEnrollmentModalClose}
          />
        )}
      </AnimatePresence>

      {/* Modal d'inscription multiple */}
      <AnimatePresence>
        {showMultipleEnrollmentModal && (
          <EnrollMultipleStudentsModal
            students={allStudents}
            isOpen={true}
            onClose={handleMultipleEnrollmentModalClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
