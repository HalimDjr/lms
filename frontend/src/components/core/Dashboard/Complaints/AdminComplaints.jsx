// components/core/Dashboard/AdminComplaints.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaComment,
  FaPlay,
} from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  getAllComplaints,
  processComplaint,
} from "../../../../services/operations/complaintAPI";

export default function AdminComplaints() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints(token);
        setComplaints(data);
        setFilteredComplaints(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des réclamations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  useEffect(() => {
    // Filtrer les réclamations en fonction des critères
    let filtered = [...complaints];

    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.user.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.user.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (complaint) => complaint.status === statusFilter
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (complaint) => complaint.category === categoryFilter
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    setAction(null);
    setAdminResponse(complaint.adminResponse || "");
  };

  const handleInProgress = (complaint) => {
    setSelectedComplaint(complaint);
    setAction("in-progress");
    setShowModal(true);
    setAdminResponse(complaint.adminResponse || "");
  };

  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setAction("resolve");
    setShowModal(true);
    setAdminResponse(complaint.adminResponse || "");
  };

  const handleReject = (complaint) => {
    setSelectedComplaint(complaint);
    setAction("reject");
    setShowModal(true);
    setAdminResponse(complaint.adminResponse || "");
  };

  const handleProcess = async () => {
    if (!selectedComplaint || !action) return;

    const status =
      action === "in-progress"
        ? "in-progress"
        : action === "resolve"
        ? "resolved"
        : "rejected";

    if (
      (status === "resolved" || status === "rejected") &&
      !adminResponse.trim()
    ) {
      return; // Exiger une réponse pour résoudre ou rejeter
    }

    setProcessing(true);
    try {
      const response = await processComplaint(
        selectedComplaint._id,
        status,
        adminResponse,
        token
      );

      if (response.success) {
        // Mettre à jour la liste des réclamations
        const updatedComplaints = complaints.map((comp) =>
          comp._id === selectedComplaint._id
            ? {
                ...comp,
                status,
                adminResponse,
              }
            : comp
        );
        setComplaints(updatedComplaints);
        setFilteredComplaints(updatedComplaints);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la réclamation:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return darkMode
          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
          : "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "in-progress":
        return darkMode
          ? "bg-blue-900/30 text-blue-300 border border-blue-800"
          : "bg-blue-100 text-blue-800 border border-blue-200";
      case "resolved":
        return darkMode
          ? "bg-green-900/30 text-green-300 border border-green-800"
          : "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return darkMode
          ? "bg-red-900/30 text-red-300 border border-red-800"
          : "bg-red-100 text-red-800 border border-red-200";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in-progress":
        return "En cours";
      case "resolved":
        return "Résolu";
      case "rejected":
        return "Rejeté";
      default:
        return status;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case "technique":
        return "Problème technique";
      case "contenu":
        return "Contenu du cours";
      case "paiement":
        return "Problème de paiement";
      case "utilisateur":
        return "Problème avec un utilisateur";
      case "autre":
        return "Autre";
      default:
        return category;
    }
  };

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "technique", label: "Problème technique" },
    { value: "contenu", label: "Contenu du cours" },
    { value: "paiement", label: "Problème de paiement" },
    { value: "utilisateur", label: "Problème avec un utilisateur" },
    { value: "autre", label: "Autre" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner
          className={`animate-spin text-3xl mb-4 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Chargement des réclamations...
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Réclamations
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg w-full sm:w-64 ${
                darkMode
                  ? "bg-richblack-700 border-richblack-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } border focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
            />
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg appearance-none w-full sm:w-auto ${
                darkMode
                  ? "bg-richblack-700 border-richblack-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } border focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="resolved">Résolus</option>
              <option value="rejected">Rejetés</option>
            </select>
            <FaFilter
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>

          {/* Filtre par catégorie */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg appearance-none w-full sm:w-auto ${
                darkMode
                  ? "bg-richblack-700 border-richblack-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } border focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <FaFilter
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-16 rounded-xl ${
            darkMode ? "bg-richblack-700" : "bg-gray-50"
          }`}
        >
          <FaExclamationTriangle
            className={`text-4xl mb-4 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <p
            className={`text-lg font-medium ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Aucune réclamation trouvée.
          </p>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "Essayez de modifier vos critères de recherche."
              : "Les réclamations apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div
          className={`rounded-xl overflow-hidden border ${
            darkMode ? "border-richblack-700" : "border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? "bg-richblack-700" : "bg-gray-50"}>
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Utilisateur
                  </th>

                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Catégorie
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? "divide-richblack-700" : "divide-gray-200"
                }`}
              >
                {filteredComplaints.map((complaint) => (
                  <motion.tr
                    key={complaint._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${
                      darkMode
                        ? "bg-richblack-800 hover:bg-richblack-700"
                        : "bg-white hover:bg-gray-50"
                    } transition-colors duration-150`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            darkMode ? "bg-richblack-700" : "bg-gray-100"
                          }`}
                        >
                          <FaUser
                            className={
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }
                          />
                        </div>
                        <div className="ml-4">
                          <div
                            className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {complaint.user.firstName} {complaint.user.lastName}
                          </div>
                          <div
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {complaint.user.email}
                          </div>
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {complaint.user.accountType}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {getCategoryText(complaint.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt
                          className={`mr-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {format(
                            new Date(complaint.createdAt),
                            "dd MMMM yyyy",
                            {
                              locale: fr,
                            }
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs font-medium rounded-full ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {getStatusText(complaint.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {complaint.status === "pending" && (
                          <button
                            onClick={() => handleInProgress(complaint)}
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            } transition-colors`}
                            title="Marquer en cours"
                          >
                            <FaPlay className="w-4 h-4" />
                          </button>
                        )}

                        {(complaint.status === "pending" ||
                          complaint.status === "in-progress") && (
                          <>
                            <button
                              onClick={() => handleResolve(complaint)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-green-900/20 text-green-400 hover:bg-green-900/30"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              } transition-colors`}
                              title="Résoudre"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(complaint)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-red-900/20 text-red-400 hover:bg-red-900/30"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              } transition-colors`}
                              title="Rejeter"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de détails/traitement */}
      <AnimatePresence>
        {showModal && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !processing && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-2xl w-full rounded-xl shadow-2xl ${
                darkMode ? "bg-richblack-800" : "bg-white"
              } overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête du modal */}
              <div
                className={`px-6 py-4 border-b ${
                  darkMode
                    ? "border-richblack-700 bg-richblack-700"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {action === "in-progress"
                    ? "Marquer en cours"
                    : action === "resolve"
                    ? "Résoudre la réclamation"
                    : action === "reject"
                    ? "Rejeter la réclamation"
                    : "Détails de la réclamation"}
                </h3>
              </div>

              {/* Corps du modal */}
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-richblack-700" : "bg-gray-100"
                      }`}
                    >
                      <FaUser
                        className={`text-xl ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Utilisateur
                      </p>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {selectedComplaint.user.firstName}{" "}
                        {selectedComplaint.user.lastName}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {selectedComplaint.user.email} (
                        {selectedComplaint.user.accountType})
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Sujet
                    </p>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedComplaint.subject}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Catégorie
                    </p>
                    <p
                      className={`${darkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {getCategoryText(selectedComplaint.category)}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Description
                    </p>
                    <p
                      className={`${
                        darkMode ? "text-white" : "text-gray-800"
                      } whitespace-pre-wrap`}
                    >
                      {selectedComplaint.description}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Réponse{" "}
                      {(action === "resolve" || action === "reject") && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className={`w-full p-3 rounded-lg ${
                        darkMode
                          ? "bg-richblack-700 text-white border-richblack-600"
                          : "bg-gray-50 text-gray-900 border-gray-300"
                      } border focus:ring-2 focus:outline-none ${
                        darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                      }`}
                      rows="4"
                      placeholder="Votre réponse à cette réclamation..."
                      required={action === "resolve" || action === "reject"}
                      disabled={!action}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Pied du modal */}
              <div
                className={`px-6 py-4 border-t ${
                  darkMode ? "border-richblack-700" : "border-gray-200"
                } flex justify-end gap-3`}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-white hover:bg-richblack-600"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } transition-colors`}
                  disabled={processing}
                >
                  Fermer
                </button>

                {action && (
                  <button
                    onClick={handleProcess}
                    disabled={
                      processing ||
                      ((action === "resolve" || action === "reject") &&
                        !adminResponse.trim())
                    }
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      action === "in-progress"
                        ? darkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : action === "resolve"
                        ? darkMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                        : darkMode
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    } ${
                      processing ||
                      ((action === "resolve" || action === "reject") &&
                        !adminResponse.trim())
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } transition-colors`}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Traitement...</span>
                      </>
                    ) : action === "in-progress" ? (
                      <>
                        <FaPlay />
                        <span>Marquer en cours</span>
                      </>
                    ) : action === "resolve" ? (
                      <>
                        <FaCheck />
                        <span>Résoudre</span>
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        <span>Rejeter</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
