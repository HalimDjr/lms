import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaUserShield,
  FaFilter,
} from "react-icons/fa";
import { MdOutlineFilterAlt, MdVerified, MdBlock } from "react-icons/md";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../../common/ConfirmationModal";
import IconBtn from "../../../common/IconBtn";
import { apiConnector } from "../../../../services/apiConnector";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function AdminManagement() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [allAdmins, setAllAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
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
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Récupérer tous les administrateurs
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "GET",
        `${BASE_URL}/admin/users?accountType=Admin`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        const adminsData = response.data.data || [];
        setAllAdmins(adminsData);
        setTotalItems(adminsData.length);
        applyFiltersAndPagination(adminsData);
      } else {
        console.error("Erreur API:", response?.data);
        toast.error("Impossible de charger les administrateurs");
        setAllAdmins([]);
        setAdmins([]);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des administrateurs:",
        error
      );
      toast.error("Impossible de charger les administrateurs");
      setAllAdmins([]);
      setAdmins([]);
    }
    setLoading(false);
  };

  // Appliquer les filtres, le tri et la pagination
  const applyFiltersAndPagination = (data) => {
    if (!Array.isArray(data)) {
      console.error("Les données à filtrer ne sont pas un tableau:", data);
      setAdmins([]);
      setTotalPages(1);
      return;
    }

    let filteredData = [...data];

    // Appliquer le filtre de statut
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filteredData = filteredData.filter((admin) => admin.active === isActive);
    }

    // Appliquer la recherche
    if (searchTerm) {
      filteredData = filteredData.filter(
        (admin) =>
          admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculer le nombre total d'éléments filtrés
    const filteredCount = filteredData.length;
    setTotalItems(filteredCount);

    // Calculer le nombre total de pages
    const calculatedTotalPages = Math.ceil(filteredCount / itemsPerPage) || 1;
    setTotalPages(calculatedTotalPages);

    // Ajuster la page courante si nécessaire
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }

    // Appliquer le tri
    filteredData.sort((a, b) => {
      let valueA, valueB;

      // Gestion des cas spéciaux pour le tri
      if (sortField === "firstName") {
        valueA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
        valueB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
      } else if (sortField === "active") {
        valueA = a.active ? 1 : 0;
        valueB = b.active ? 1 : 0;
      } else {
        valueA = (a[sortField] || "").toString().toLowerCase();
        valueB = (b[sortField] || "").toString().toLowerCase();
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    // Appliquer la pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setAdmins(paginatedData);
  };

  // Supprimer un administrateur
  const handleDeleteAdmin = async (adminId) => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "DELETE",
        `${BASE_URL}/admin/users/${adminId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Administrateur supprimé avec succès");
        fetchAdmins();
      } else {
        toast.error("Erreur lors de la suppression de l'administrateur");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'administrateur:",
        error
      );
      toast.error("Erreur lors de la suppression de l'administrateur");
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

  // Appliquer les filtres, le tri et la pagination lorsque les états changent
  useEffect(() => {
    if (Array.isArray(allAdmins)) {
      applyFiltersAndPagination(allAdmins);
    }
  }, [
    searchTerm,
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage,
    statusFilter,
  ]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fonction pour afficher l'icône de tri appropriée
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Fonction pour basculer le menu d'actions
  const toggleActionMenu = (adminId) => {
    setActiveActionMenu(activeActionMenu === adminId ? null : adminId);
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
  const getStatusColor = (admin) => {
    if (admin.active) {
      return {
        bg: darkMode ? "bg-green-100" : "bg-green-100",
        text: "text-green-700",
        icon: <MdVerified className="mr-1" />,
      };
    } else {
      return {
        bg: darkMode ? "bg-red-100" : "bg-red-100",
        text: "text-red-700",
        icon: <MdBlock className="mr-1" />,
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
      {/* En-tête avec titre et boutons d'action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-transparent to-transparent via-transparent p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${
              darkMode ? "bg-richblack-700" : "bg-blue-100"
            }`}
          >
            <FaUserShield
              className={`text-xl ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
          </div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Gestion des Administrateurs
          </h1>
        </div>

        <Link to="/dashboard/add-admin">
          <IconBtn
            text="Ajouter un administrateur"
            variant="primary"
            size="medium"
          >
            <FaUserPlus />
          </IconBtn>
        </Link>
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
              placeholder="Rechercher un administrateur..."
              value={searchTerm}
              onChange={handleSearch}
              className={`pl-10 pr-4 py-3 rounded-lg w-full sm:w-64 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-white text-gray-800 border-gray-300"
              } border focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500/50" : "focus:ring-blue-500/50"
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
                } border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200`}
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
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          statusFilter === "all"
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500 text-white"
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
                        onClick={() => handleSort("active")}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          sortField === "active"
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500 text-white"
                            : darkMode
                            ? "bg-richblack-800 text-richblack-100"
                            : "bg-white text-gray-700 border border-gray-200"
                        } transition-all duration-200`}
                      >
                        Statut{" "}
                        {sortField === "active" &&
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

      {/* Liste des administrateurs */}
      <div
        className={`rounded-xl overflow-hidden ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className={darkMode ? "text-richblack-300" : "text-gray-500"}>
              Chargement des administrateurs...
            </p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className={`p-4 rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-gray-100"
              } mb-4`}
            >
              <FaUserShield
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
              Aucun administrateur trouvé
            </p>
            <p
              className={`text-center text-sm mt-2 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            >
              {searchTerm || statusFilter !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Ajoutez des administrateurs pour commencer"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
                  {admins.map((admin, index) => {
                    const statusColor = getStatusColor(admin);

                    return (
                      <motion.tr
                        key={admin._id}
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
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                              <img
                                src={
                                  admin.image ||
                                  "https://ui-avatars.com/api/?name=" +
                                    admin.firstName +
                                    "+" +
                                    admin.lastName
                                }
                                alt={admin.firstName}
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
                                {admin.firstName} {admin.lastName}
                              </span>
                              {admin.contactNumber && (
                                <p
                                  className={`text-xs ${
                                    darkMode
                                      ? "text-richblack-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {admin.contactNumber}
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
                          {admin.email}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                              statusColor.bg + " " + statusColor.text
                            }`}
                          >
                            {statusColor.icon}
                            {admin.active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link to={`/dashboard/edit-admin/${admin._id}`}>
                              <button
                                className={`p-2 rounded-lg ${
                                  darkMode
                                    ? "bg-richblack-700 text-blue-400 hover:bg-richblack-600"
                                    : "bg-gray-100 text-blue-500 hover:bg-gray-200"
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
                                    "Cet administrateur sera supprimé définitivement",
                                  btn1Text: "Supprimer",
                                  btn2Text: "Annuler",
                                  btn1Handler: () =>
                                    handleDeleteAdmin(admin._id),
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
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Version mobile - cartes */}
            <div className="md:hidden space-y-4 p-4">
              <AnimatePresence>
                {admins.map((admin, index) => {
                  const statusColor = getStatusColor(admin);

                  return (
                    <motion.div
                      key={admin._id}
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
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                            <img
                              src={
                                admin.image ||
                                "https://ui-avatars.com/api/?name=" +
                                  admin.firstName +
                                  "+" +
                                  admin.lastName
                              }
                              alt={admin.firstName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3
                              className={`font-medium ${
                                darkMode ? "text-richblack-5" : "text-gray-800"
                              }`}
                            >
                              {admin.firstName} {admin.lastName}
                            </h3>
                            <p
                              className={`text-sm ${
                                darkMode
                                  ? "text-richblack-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {admin.email}
                            </p>
                          </div>
                        </div>
                        <div className="relative action-menu-container">
                          <button
                            onClick={() => toggleActionMenu(admin._id)}
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-richblack-800 text-richblack-300 hover:bg-richblack-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } transition-all duration-200`}
                          >
                            <FaEllipsisV />
                          </button>
                          <AnimatePresence>
                            {activeActionMenu === admin._id && (
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
                                    to={`/dashboard/edit-admin/${admin._id}`}
                                    className={`flex items-center px-4 py-3 text-sm ${
                                      darkMode
                                        ? "text-richblack-100 hover:bg-richblack-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    <FaEdit className="mr-3 text-blue-500" />{" "}
                                    Modifier
                                  </Link>
                                  <button
                                    onClick={() =>
                                      setConfirmationModal({
                                        text1: "Êtes-vous sûr ?",
                                        text2:
                                          "Cet administrateur sera supprimé définitivement",
                                        btn1Text: "Supprimer",
                                        btn2Text: "Annuler",
                                        btn1Handler: () =>
                                          handleDeleteAdmin(admin._id),
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

                      <div className="mt-3 space-y-2">
                        {admin.contactNumber && (
                          <div
                            className={`text-sm ${
                              darkMode ? "text-richblack-300" : "text-gray-600"
                            }`}
                          >
                            {admin.contactNumber}
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
                          {admin.active ? "Actif" : "Inactif"}
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
            sur <span className="font-medium">{totalItems}</span>{" "}
            administrateurs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-500 hover:text-white"
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
                          ? "bg-blue-500 text-white"
                          : "bg-blue-500 text-white"
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
                  : "hover:bg-blue-500 hover:text-white"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <FaUserShield
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
                  Total des administrateurs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {allAdmins.length}
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
                <MdVerified
                  className={`text-xl ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Administrateurs actifs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {allAdmins.filter((admin) => admin.active).length}
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
                <MdBlock
                  className={`text-xl ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Administrateurs inactifs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  {allAdmins.filter((admin) => !admin.active).length}
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
    </motion.div>
  );
}
