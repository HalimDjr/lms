import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaCheck,
  FaFilePdf,
  FaFileImport,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaChalkboardTeacher,
  FaSchool,
  FaDownload,
  FaUpload,
  FaFilter,
} from "react-icons/fa";
import { MdOutlineFilterAlt, MdVerified, MdPending } from "react-icons/md";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../../common/ConfirmationModal";
import IconBtn from "../../../common/IconBtn";
import { apiConnector } from "../../../../services/apiConnector";
import { exportUsersToPDF } from "../../../../services/operations/adminAPI";
import { FaUserSlash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function InstructorManagement() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [allInstructors, setAllInstructors] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const fileInputRef = useRef(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [approvalFilter, setApprovalFilter] = useState("all"); // 'all', 'approved', 'pending', 'inactive'
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });

  const fetchInstructorStats = async () => {
    try {
      const response = await apiConnector(
        "GET",
        `${BASE_URL}/admin/instructor-stats`,
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

  // Récupérer les instructeurs avec pagination côté serveur
  const fetchInstructors = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/admin/users?accountType=Instructor&page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&sortField=${sortField}&sortDirection=${sortDirection}`;

      // Ajouter le filtre d'approbation si nécessaire
      if (approvalFilter !== "all") {
        url += `&approvalFilter=${approvalFilter}`;
      }

      const response = await apiConnector("GET", url, null, {
        Authorization: `Bearer ${token}`,
      });

      if (response?.data?.success) {
        const instructorsData = response.data.data || [];
        setInstructors(instructorsData);
        setAllInstructors(instructorsData);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error("Erreur API:", response?.data);
        toast.error("Impossible de charger les formateurs");
        setInstructors([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des formateurs:", error);
      toast.error("Impossible de charger les formateurs");
      setInstructors([]);
    }
    setLoading(false);
  };

  // Supprimer un instructeur
  const handleDeleteInstructor = async (instructorId) => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "DELETE",
        `${BASE_URL}/admin/users/${instructorId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        toast.success("Formateur supprimé avec succès");
        fetchInstructors();
      } else {
        toast.error("Erreur lors de la suppression de formateur");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de formateur:", error);
      toast.error("Erreur lors de la suppression de formateur");
    }
    setLoading(false);
    setConfirmationModal(null);
    setActiveActionMenu(null);
  };

  // Approuver un instructeur
  const handleApproveInstructor = async (instructorId) => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "PUT",
        `${BASE_URL}/admin/instructors/${instructorId}/approve`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        toast.success("Formateur approuvé avec succès");
        fetchInstructors();
      } else {
        toast.error("Erreur lors de l'approbation de formateur");
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation de formateur:", error);
      toast.error("Erreur lors de l'approbation de formateur");
    }
    setLoading(false);
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

  // Charger les instructeurs au chargement du composant
  useEffect(() => {
    fetchInstructors();
    fetchInstructorStats();
  }, []);

  // Appeler fetchInstructors lorsque les paramètres changent
  useEffect(() => {
    fetchInstructors();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    approvalFilter,
  ]);

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
        fetchInstructors();
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
    try {
      await exportUsersToPDF(token, "Instructor"); // Use the imported function
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation en PDF");
    }
  };

  // Fonction pour afficher l'icône de tri appropriée
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Fonction pour basculer le menu d'actions
  const toggleActionMenu = (instructorId) => {
    setActiveActionMenu(
      activeActionMenu === instructorId ? null : instructorId
    );
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

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (instructor) => {
    if (instructor.approved && instructor.active) {
      return {
        bg: darkMode ? "bg-green-100" : "bg-green-100",
        text: "text-green-700",
        icon: <MdVerified className="mr-1" />,
      };
    } else if (!instructor.approved) {
      return {
        bg: darkMode ? "bg-yellow-100" : "bg-yellow-100",
        text: "text-yellow-700",
        icon: <MdPending className="mr-1" />,
      };
    } else {
      return {
        bg: darkMode ? "bg-red-100" : "bg-red-100",
        text: "text-red-700",
        icon: <FaEllipsisV className="mr-1" />,
      };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-transparent to-transparent via-transparent p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${
              darkMode ? "bg-richblack-700" : "bg-yellow-100"
            }`}
          >
            <FaChalkboardTeacher
              className={`text-xl ${
                darkMode ? "text-yellow-50" : "text-yellow-600"
              }`}
            />
          </div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Gestion des formateurs
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
          <Link to="/dashboard/add-instructor">
            <IconBtn
              text="Ajouter un formateur"
              variant="primary"
              size="medium"
            >
              <FaUserPlus />
            </IconBtn>
          </Link>
        </div>
      </div>

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
              placeholder="Rechercher un formateur..."
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
                      Statut d'approbation
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setApprovalFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          approvalFilter === "all"
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
                        onClick={() => setApprovalFilter("approved")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          approvalFilter === "approved"
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
                        onClick={() => setApprovalFilter("pending")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          approvalFilter === "pending"
                            ? darkMode
                              ? "bg-yellow-500 text-white"
                              : "bg-yellow-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        En attente
                      </button>
                      <button
                        onClick={() => setApprovalFilter("inactive")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          approvalFilter === "inactive"
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

                  <div className="flex flex-col gap-2">
                    <label
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Trier par
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleSort("firstName")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          sortField === "firstName"
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Nom{" "}
                        {sortField === "firstName" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                      <button
                        onClick={() => handleSort("email")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          sortField === "email"
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Email{" "}
                        {sortField === "email" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                      <button
                        onClick={() => handleSort("approved")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          sortField === "approved"
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Statut{" "}
                        {sortField === "approved" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              Chargement des formateurs...
            </p>
          </div>
        ) : instructors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className={`p-4 rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-gray-100"
              } mb-4`}
            >
              <FaChalkboardTeacher
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
              Aucun formateur trouvé
            </p>
            <p
              className={`text-center text-sm mt-2 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            >
              {searchTerm || approvalFilter !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Ajoutez des formateurs pour commencer"}
            </p>
            {(searchTerm || approvalFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setApprovalFilter("all");
                }}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-all duration-200`}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    onClick={() => handleSort("ecole")}
                  >
                    <div className="flex items-center gap-2">
                      École {renderSortIcon("ecole")}
                    </div>
                  </th>
                  <th
                    className={`p-4 text-left ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    } cursor-pointer`}
                    onClick={() => handleSort("approved")}
                  >
                    <div className="flex items-center gap-2">
                      Statut {renderSortIcon("approved")}
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
                  {instructors.map((instructor, index) => {
                    const statusColor = getStatusColor(instructor);

                    return (
                      <motion.tr
                        key={instructor._id}
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
                                  instructor.image ||
                                  "https://ui-avatars.com/api/?name=" +
                                    instructor.firstName +
                                    "+" +
                                    instructor.lastName
                                }
                                alt={instructor.firstName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span
                                className={`font-medium ${
                                  darkMode
                                    ? "text-richblack-5"
                                    : "text-gray-800"
                                }`}
                              >
                                {instructor.firstName} {instructor.lastName}
                              </span>
                              {instructor.contactNumber && (
                                <p
                                  className={`text-xs ${
                                    darkMode
                                      ? "text-richblack-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {instructor.contactNumber}
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
                          {instructor.email}
                        </td>
                        <td
                          className={`p-4 ${
                            darkMode ? "text-richblack-300" : "text-gray-600"
                          }`}
                        >
                          {instructor.additionalDetails &&
                          instructor.additionalDetails.ecole ? (
                            <div className="flex items-center gap-2">
                              <FaSchool
                                className={
                                  darkMode
                                    ? "text-yellow-300"
                                    : "text-yellow-600"
                                }
                              />
                              <span>{instructor.additionalDetails.ecole}</span>
                            </div>
                          ) : (
                            <span className="text-sm italic opacity-70">
                              Non spécifiée
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                              statusColor.bg + " " + statusColor.text
                            }`}
                          >
                            {statusColor.icon}
                            {instructor.approved && instructor.active
                              ? "Actif"
                              : !instructor.approved
                              ? "En attente d'approbation"
                              : "Inactif"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/dashboard/edit-instructor/${instructor._id}`}
                            >
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
                                    "Cet formateur sera supprimé définitivement",
                                  btn1Text: "Supprimer",
                                  btn2Text: "Annuler",
                                  btn1Handler: () =>
                                    handleDeleteInstructor(instructor._id),
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
                            {!instructor.approved && (
                              <button
                                onClick={() =>
                                  handleApproveInstructor(instructor._id)
                                }
                                className={`p-2 rounded-lg ${
                                  darkMode
                                    ? "bg-richblack-700 text-green-300 hover:bg-richblack-600"
                                    : "bg-gray-100 text-green-600 hover:bg-gray-200"
                                } transition-all duration-200`}
                                title="Approuver formateur"
                              >
                                <FaCheck size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            <div className="md:hidden space-y-4 p-4">
              <AnimatePresence>
                {instructors.map((instructor, index) => {
                  const statusColor = getStatusColor(instructor);

                  return (
                    <motion.div
                      key={instructor._id}
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
                                instructor.image ||
                                "https://ui-avatars.com/api/?name=" +
                                  instructor.firstName +
                                  "+" +
                                  instructor.lastName
                              }
                              alt={instructor.firstName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3
                              className={`font-medium ${
                                darkMode ? "text-richblack-5" : "text-gray-800"
                              }`}
                            >
                              {instructor.firstName} {instructor.lastName}
                            </h3>
                            <p
                              className={`text-sm ${
                                darkMode
                                  ? "text-richblack-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {instructor.email}
                            </p>
                          </div>
                        </div>
                        <div className="relative action-menu-container">
                          <button
                            onClick={() => toggleActionMenu(instructor._id)}
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-richblack-800 text-richblack-300 hover:bg-richblack-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } transition-all duration-200`}
                          >
                            <FaEllipsisV />
                          </button>
                          <AnimatePresence>
                            {activeActionMenu === instructor._id && (
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
                                  <Link
                                    to={`/dashboard/edit-instructor/${instructor._id}`}
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
                                          "Cet formateur sera supprimé définitivement",
                                        btn1Text: "Supprimer",
                                        btn2Text: "Annuler",
                                        btn1Handler: () =>
                                          handleDeleteInstructor(
                                            instructor._id
                                          ),
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
                                  {!instructor.approved && (
                                    <button
                                      onClick={() =>
                                        handleApproveInstructor(instructor._id)
                                      }
                                      className={`flex items-center w-full text-left px-4 py-3 text-sm ${
                                        darkMode
                                          ? "text-green-300 hover:bg-richblack-700"
                                          : "text-green-600 hover:bg-gray-100"
                                      }`}
                                    >
                                      <FaCheck className="mr-3" /> Approuver
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {instructor.additionalDetails &&
                          instructor.additionalDetails.ecole && (
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                darkMode
                                  ? "text-richblack-300"
                                  : "text-gray-600"
                              }`}
                            >
                              <FaSchool
                                className={
                                  darkMode
                                    ? "text-yellow-300"
                                    : "text-yellow-600"
                                }
                              />
                              <span>{instructor.additionalDetails.ecole}</span>
                            </div>
                          )}

                        {instructor.contactNumber && (
                          <div
                            className={`text-sm ${
                              darkMode ? "text-richblack-300" : "text-gray-600"
                            }`}
                          >
                            {instructor.contactNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                            statusColor.bg + " " + statusColor.text
                          }`}
                        >
                          {statusColor.icon}
                          {instructor.approved && instructor.active
                            ? "Actif"
                            : !instructor.approved
                            ? "En attente d'approbation"
                            : "Inactif"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

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
            sur <span className="font-medium">{totalItems}</span> formateurs
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
      <div
        className={`p-4 rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total des formateurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-xl shadow-sm ${
              darkMode
                ? "bg-gradient-to-br from-richblack-700 to-richblack-800 border border-richblack-600"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}
              >
                <FaChalkboardTeacher
                  className={`text-2xl ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Total des formateurs
                </p>
                <div className="flex items-end gap-1">
                  <h3
                    className={`text-3xl font-bold ${
                      darkMode ? "text-richblack-5" : "text-gray-800"
                    }`}
                  >
                    {stats.total || 0}
                  </h3>
                  <span
                    className={`text-xs mb-1 ${
                      darkMode ? "text-richblack-400" : "text-gray-500"
                    }`}
                  >
                    formateurs
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
          </motion.div>

          {/* Formateurs actifs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`p-5 rounded-xl shadow-sm ${
              darkMode
                ? "bg-gradient-to-br from-richblack-700 to-richblack-800 border border-richblack-600"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-green-900/30" : "bg-green-100"
                }`}
              >
                <MdVerified
                  className={`text-2xl ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Formateurs actifs
                </p>
                <div className="flex items-end gap-1">
                  <h3
                    className={`text-3xl font-bold ${
                      darkMode ? "text-richblack-5" : "text-gray-800"
                    }`}
                  >
                    {stats.active || 0}
                  </h3>
                  <span
                    className={`text-xs mb-1 ${
                      darkMode ? "text-richblack-400" : "text-gray-500"
                    }`}
                  >
                    actifs
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
          </motion.div>

          {/* En attente d'approbation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`p-5 rounded-xl shadow-sm ${
              darkMode
                ? "bg-gradient-to-br from-richblack-700 to-richblack-800 border border-richblack-600"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}
              >
                <MdPending
                  className={`text-2xl ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  En attente
                </p>
                <div className="flex items-end gap-1">
                  <h3
                    className={`text-3xl font-bold ${
                      darkMode ? "text-richblack-5" : "text-gray-800"
                    }`}
                  >
                    {stats.pending || 0}
                  </h3>
                  <span
                    className={`text-xs mb-1 ${
                      darkMode ? "text-richblack-400" : "text-gray-500"
                    }`}
                  >
                    en attente
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
          </motion.div>

          {/* Formateurs inactifs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`p-5 rounded-xl shadow-sm ${
              darkMode
                ? "bg-gradient-to-br from-richblack-700 to-richblack-800 border border-richblack-600"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  darkMode ? "bg-red-900/30" : "bg-red-100"
                }`}
              >
                <FaUserSlash
                  className={`text-2xl ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Formateurs inactifs
                </p>
                <div className="flex items-end gap-1">
                  <h3
                    className={`text-3xl font-bold ${
                      darkMode ? "text-richblack-5" : "text-gray-800"
                    }`}
                  >
                    {stats.inactive || 0}
                  </h3>
                  <span
                    className={`text-xs mb-1 ${
                      darkMode ? "text-richblack-400" : "text-gray-500"
                    }`}
                  >
                    inactifs
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gradient-to-r from-red-500 to-red-300 rounded-full"></div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {confirmationModal && (
          <ConfirmationModal modalData={confirmationModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
