// frontend/src/components/core/Dashboard/InstructorApplications/InstructorApplicationDetails.jsx
import React from "react";
import {
  FaTimes,
  FaCheck,
  FaTrash,
  FaFilePdf,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaVenusMars,
  FaUniversity,
  FaPhone,
  FaClock,
  FaTag,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const InstructorApplicationDetails = ({
  application,
  onClose,
  onUpdateStatus,
  onDelete,
  darkMode,
}) => {
  const { token } = useSelector((state) => state.auth);

  const handleDownloadCV = () => {
    // Vérifier si l'URL du CV commence par /uploads/ (stockage local)
    if (application.cv && application.cv.startsWith("/uploads/")) {
      // Pour les fichiers stockés localement
      // Utilisez l'URL de base sans le chemin API
      const baseURL = import.meta.env.VITE_APP_BASE_URL.replace("/api/v1", "");
      window.open(`${baseURL}${application.cv}`, "_blank");
    } else {
      // Pour les fichiers qui nécessitent une authentification
      window.open(
        `${import.meta.env.VITE_APP_BASE_URL}/instructor-applications/${
          application._id
        }/download-cv?token=${token}`,
        "_blank"
      );
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      },
    },
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "En attente":
        return {
          bg: darkMode ? "bg-yellow-900/30" : "bg-yellow-100",
          text: "text-yellow-500",
          icon: (
            <div
              className={`h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse`}
            ></div>
          ),
        };
      case "Accepté":
        return {
          bg: darkMode ? "bg-green-900/30" : "bg-green-100",
          text: "text-green-500",
          icon: <FaCheck className="mr-2" size={12} />,
        };
      case "Refusé":
        return {
          bg: darkMode ? "bg-red-900/30" : "bg-red-100",
          text: "text-red-500",
          icon: <FaTimes className="mr-2" size={12} />,
        };
      default:
        return {
          bg: darkMode ? "bg-gray-800" : "bg-gray-100",
          text: darkMode ? "text-gray-300" : "text-gray-700",
          icon: null,
        };
    }
  };

  const statusStyle = getStatusStyle(application.status);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className={`relative w-full max-w-3xl p-0 rounded-xl shadow-2xl overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700"
            : "bg-white"
        }`}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-2 border-b ${
            darkMode ? "border-richblack-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                  darkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}
              >
                <span
                  className={`text-xl font-bold ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {application.firstName?.charAt(0)}
                  {application.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-richblack-800"
                  }`}
                >
                  {application.firstName} {application.lastName}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`rounded-full p-2 transition-colors ${
                darkMode
                  ? "bg-richblack-700 text-richblack-300 hover:bg-richblack-600 hover:text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
              aria-label="Fermer"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-richblack-700/50" : "bg-gray-50"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-richblack-800"
                }`}
              >
                Informations personnelles
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUser
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Nom complet
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.firstName} {application.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaEnvelope
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Email
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCalendarAlt
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Date de naissance
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.dateOfBirth}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaVenusMars
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Genre
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.gender}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-richblack-700/50" : "bg-gray-50"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-richblack-800"
                }`}
              >
                Informations professionnelles
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUniversity
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      École/Institution
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.school}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaPhone
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Numéro de téléphone
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {application.contactNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaClock
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Date de candidature
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        darkMode ? "text-white" : "text-richblack-800"
                      }`}
                    >
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaTag
                    className={`mt-1 mr-3 ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-300" : "text-gray-500"
                      }`}
                    >
                      Statut
                    </p>
                    <div
                      className={`mt-1 inline-flex items-center px-3 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.icon}
                      <span>{application.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CV Section */}
          <div
            className={`mt-4  rounded-lg ${
              darkMode ? "bg-richblack-700/50" : "bg-gray-50"
            }`}
          >
            {application.cv ? (
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  darkMode ? "bg-richblack-800" : "bg-white"
                } border ${
                  darkMode ? "border-richblack-600" : "border-gray-200"
                }`}
              >
                <div
                  className={`p-3 rounded-lg mr-4 ${
                    darkMode ? "bg-red-900/20" : "bg-red-100"
                  }`}
                >
                  <FaFilePdf size={24} className="text-red-500" />
                </div>
                <div className="flex-grow">
                  <p
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-richblack-800"
                    }`}
                  >
                    CV du candidat
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    Document PDF
                  </p>
                </div>
                <button
                  onClick={handleDownloadCV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode
                      ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  <FaDownload size={16} />
                  <span>Télécharger</span>
                </button>
              </div>
            ) : (
              <div
                className={`flex items-center p-4 rounded-lg ${
                  darkMode ? "bg-richblack-800" : "bg-white"
                } border ${
                  darkMode ? "border-richblack-600" : "border-gray-200"
                }`}
              >
                <div
                  className={`p-3 rounded-lg mr-4 ${
                    darkMode ? "bg-red-900/20" : "bg-red-100"
                  }`}
                >
                  <FaFilePdf size={24} className="text-red-500" />
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-richblack-800"
                    }`}
                  >
                    CV non disponible
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    Le candidat n'a pas fourni de CV
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div
          className={`px-6 py-3 border-t ${
            darkMode ? "border-richblack-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-wrap justify-end gap-3">
            {application.status === "En attente" && (
              <>
                <button
                  onClick={() => onUpdateStatus(application._id, "Accepté")}
                  className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                >
                  <FaCheck />
                  <span>Accepter</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(application._id, "Refusé")}
                  className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  <FaTimes />
                  <span>Refuser</span>
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(application._id)}
              className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <FaTrash />
              <span>Supprimer</span>
            </button>
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-richblack-700 text-white hover:bg-richblack-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstructorApplicationDetails;
