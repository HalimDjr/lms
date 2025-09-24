// frontend/src/components/core/Dashboard/InstructorApplications/InstructorApplicationsTab.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAllInstructorApplications,
  updateInstructorApplicationStatus,
  deleteInstructorApplication,
} from "../../../../services/operations/instructorApplicationAPI";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import InstructorApplicationDetails from "./InstructorApplicationDetails";

const InstructorApplicationsTab = () => {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    const data = await getAllInstructorApplications(token, statusFilter);
    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (applicationId, status) => {
    const updatedApplication = await updateInstructorApplicationStatus(
      applicationId,
      status,
      token
    );
    if (updatedApplication) {
      fetchApplications();
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")
    ) {
      const success = await deleteInstructorApplication(applicationId, token);
      if (success) {
        fetchApplications();
        if (showDetailsModal && selectedApplication?._id === applicationId) {
          setShowDetailsModal(false);
        }
      }
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "En attente").length,
    accepted: applications.filter((app) => app.status === "Accepté").length,
    rejected: applications.filter((app) => app.status === "Refusé").length,
  };

  return (
    <div className="w-full">
      {/* Header with stats */}
      <div
        className={`mb-8 ${
          darkMode ? "bg-richblack-800" : "bg-white"
        } rounded-xl p-6 shadow-md`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              Candidatures de formateurs
            </h1>
            <p
              className={`mt-1 ${
                darkMode ? "text-richblack-300" : "text-gray-600"
              }`}
            >
              Gérez les demandes de candidature pour devenir formateur
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplications}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-blue-50"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-gray-600"
              }`}
            >
              Total
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              {statusCounts.total}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-yellow-50"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-yellow-700"
              }`}
            >
              En attente
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              {statusCounts.pending}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-green-50"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-green-700"
              }`}
            >
              Acceptés
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            >
              {statusCounts.accepted}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-red-50"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-red-700"
              }`}
            >
              Refusés
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              {statusCounts.rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div
        className={`mb-6 p-6 rounded-xl ${
          darkMode ? "bg-richblack-800" : "bg-white"
        } shadow-md`}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch
                className={darkMode ? "text-richblack-400" : "text-gray-400"}
              />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 ${
                darkMode
                  ? "bg-richblack-700 text-white border-richblack-600 focus:ring-blue-500"
                  : "bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter
              className={darkMode ? "text-richblack-300" : "text-gray-500"}
            />
            <span
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Filtrer par statut:
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-md transition-all ${
              statusFilter === ""
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "bg-richblack-700 text-white hover:bg-richblack-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter("En attente")}
            className={`px-4 py-2 rounded-md transition-all ${
              statusFilter === "En attente"
                ? "bg-yellow-500 text-white"
                : darkMode
                ? "bg-richblack-700 text-white hover:bg-richblack-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setStatusFilter("Accepté")}
            className={`px-4 py-2 rounded-md transition-all ${
              statusFilter === "Accepté"
                ? "bg-green-500 text-white"
                : darkMode
                ? "bg-richblack-700 text-white hover:bg-richblack-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Acceptés
          </button>
          <button
            onClick={() => setStatusFilter("Refusé")}
            className={`px-4 py-2 rounded-md transition-all ${
              statusFilter === "Refusé"
                ? "bg-red-500 text-white"
                : darkMode
                ? "bg-richblack-700 text-white hover:bg-richblack-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Refusés
          </button>
        </div>
      </div>

      {/* Applications table */}
      <div
        className={`rounded-xl overflow-hidden shadow-md ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        {loading ? (
          <div
            className={`flex justify-center items-center h-64 ${
              darkMode ? "text-white" : "text-richblack-800"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p>Chargement des candidatures...</p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div
            className={`flex flex-col justify-center items-center h-64 ${
              darkMode ? "text-white" : "text-richblack-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-xl font-medium mb-2">
              Aucune candidature trouvée
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-400" : "text-gray-500"
              }`}
            >
              {searchTerm
                ? "Essayez avec d'autres termes de recherche"
                : "Aucune candidature ne correspond aux critères sélectionnés"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                darkMode
                  ? "divide-richblack-700 text-white"
                  : "divide-gray-200 text-richblack-800"
              }`}
            >
              <thead
                className={`${darkMode ? "bg-richblack-900" : "bg-gray-50"}`}
              >
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    École
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
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
                {filteredApplications.map((application) => (
                  <tr
                    key={application._id}
                    className={`transition-colors ${
                      darkMode ? "hover:bg-richblack-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            darkMode ? "bg-richblack-700" : "bg-blue-100"
                          }`}
                        >
                          <span
                            className={`text-lg ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            {application.firstName?.charAt(0)}
                            {application.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div
                            className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {application.firstName} {application.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          darkMode ? "text-richblack-300" : "text-gray-500"
                        }`}
                      >
                        {application.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {application.school}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          darkMode ? "text-richblack-300" : "text-gray-500"
                        }`}
                      >
                        {new Date(application.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === "En attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "Accepté"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className={`p-2 rounded-md transition-colors ${
                            darkMode
                              ? "bg-richblack-700 text-white hover:bg-richblack-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          title="Voir les détails"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {application.status === "En attente" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(application._id, "Accepté")
                              }
                              className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Accepter"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(application._id, "Refusé")
                              }
                              className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              title="Refuser"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteApplication(application._id)
                          }
                          className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedApplication && (
        <InstructorApplicationDetails
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteApplication}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default InstructorApplicationsTab;
