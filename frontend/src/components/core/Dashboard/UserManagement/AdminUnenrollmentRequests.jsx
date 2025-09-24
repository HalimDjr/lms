// components/core/Dashboard/AdminUnenrollmentRequests.jsx

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
  FaBook,
  FaComment,
} from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  getAllUnenrollmentRequests,
  processUnenrollmentRequest,
} from "../../../../services/operations/adminAPI";

export default function AdminUnenrollmentRequests() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getAllUnenrollmentRequests(token);
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  useEffect(() => {
    // Filtrer les demandes en fonction du terme de recherche et du filtre de statut
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.student.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.student.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.student.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.course.courseName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setAction(null);
    setAdminComment("");
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAction("approve");
    setShowModal(true);
    setAdminComment("");
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAction("reject");
    setShowModal(true);
    setAdminComment("");
  };

  const handleProcess = async () => {
    if (!selectedRequest || !action) return;

    setProcessing(true);
    try {
      const response = await processUnenrollmentRequest(
        selectedRequest._id,
        action === "approve" ? "approved" : "rejected",
        adminComment,
        token
      );

      if (response.success) {
        // Mettre à jour la liste des demandes
        const updatedRequests = requests.map((req) =>
          req._id === selectedRequest._id
            ? {
                ...req,
                status: action === "approve" ? "approved" : "rejected",
                adminComment,
              }
            : req
        );
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la demande:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return darkMode
          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
          : "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved":
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
      case "approved":
        return "Approuvée";
      case "rejected":
        return "Rejetée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner
          className={`animate-spin text-3xl mb-4 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Chargement des demandes...
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
          Demandes de désinscription
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
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
            <FaFilter
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
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
            Aucune demande de désinscription trouvée.
          </p>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {searchTerm || statusFilter !== "all"
              ? "Essayez de modifier vos critères de recherche."
              : "Les demandes de désinscription apparaîtront ici."}
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
                    Étudiant
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3.5 text-left text-xs font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } uppercase tracking-wider`}
                  >
                    Cours
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
                {filteredRequests.map((request) => (
                  <motion.tr
                    key={request._id}
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
                            {request.student.firstName}{" "}
                            {request.student.lastName}
                          </div>
                          <div
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {request.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {request.course.courseName}
                      </div>
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
                          {format(new Date(request.createdAt), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs font-medium rounded-full ${getStatusBadgeClass(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? "bg-richblack-700 text-blue-400 hover:bg-richblack-600"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          } transition-colors`}
                          title="Voir les détails"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className={`p-2 rounded-lg ${
                                darkMode
                                  ? "bg-green-900/20 text-green-400 hover:bg-green-900/30"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              } transition-colors`}
                              title="Approuver"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
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
        {showModal && selectedRequest && (
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
                  {action === "approve"
                    ? "Approuver la demande"
                    : action === "reject"
                    ? "Rejeter la demande"
                    : "Détails de la demande"}
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
                        Étudiant
                      </p>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {selectedRequest.student.firstName}{" "}
                        {selectedRequest.student.lastName}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {selectedRequest.student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-richblack-700" : "bg-gray-100"
                      }`}
                    >
                      <FaBook
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
                        Cours
                      </p>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {selectedRequest.course.courseName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        darkMode ? "bg-richblack-700" : "bg-gray-100"
                      }`}
                    >
                      <FaComment
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
                        Raison de la demande
                      </p>
                      <p
                        className={`${
                          darkMode ? "text-white" : "text-gray-800"
                        } whitespace-pre-wrap`}
                      >
                        {selectedRequest.reason}
                      </p>
                    </div>
                  </div>

                  {(action === "approve" || action === "reject") && (
                    <div className="mt-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Commentaire{" "}
                        {action === "reject" && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        className={`w-full p-3 rounded-lg ${
                          darkMode
                            ? "bg-richblack-700 text-white border-richblack-600"
                            : "bg-gray-50 text-gray-900 border-gray-300"
                        } border focus:ring-2 focus:outline-none ${
                          darkMode
                            ? "focus:ring-blue-500"
                            : "focus:ring-blue-500"
                        }`}
                        rows="4"
                        placeholder={
                          action === "approve"
                            ? "Commentaire optionnel pour l'approbation..."
                            : "Veuillez expliquer pourquoi vous rejetez cette demande..."
                        }
                        required={action === "reject"}
                      ></textarea>
                    </div>
                  )}
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

                {(action === "approve" || action === "reject") && (
                  <button
                    onClick={handleProcess}
                    disabled={
                      processing ||
                      (action === "reject" && !adminComment.trim())
                    }
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      action === "approve"
                        ? darkMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                        : darkMode
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    } ${
                      processing ||
                      (action === "reject" && !adminComment.trim())
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } transition-colors`}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Traitement...</span>
                      </>
                    ) : action === "approve" ? (
                      <>
                        <FaCheck />
                        <span>Approuver</span>
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
