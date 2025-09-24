// components/core/Dashboard/Settings/Settings.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaUserMinus,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaExclamationCircle,
  FaPlusCircle,
  FaListAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ChangeProfilePicture from "./ChangeProfilePicture";
import EditProfile from "./EditProfile";
import UpdatePassword from "./UpdatePassword";
import AdminUnenrollmentRequests from "../UserManagement/AdminUnenrollmentRequests";
import AdminComplaints from "../Complaints/AdminComplaints";
import UserComplaints from "../Complaints/UserComplaints";
import SubmitComplaint from "../Complaints/SubmitComplaint";

export default function Settings() {
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);
  const [activeTab, setActiveTab] = useState("personal-info");
  const [menuOpen, setMenuOpen] = useState(true);

  // Pour les écrans mobiles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = user?.accountType === "Admin";

  // Fonction pour naviguer vers l'onglet de soumission de réclamation
  const handleNavigateToSubmit = () => {
    setActiveTab("submit-complaint");
  };
  const handleNavigateBackToComplaints = () => {
    setActiveTab("complaints");
  };
  const menuItems = [
    {
      id: "personal-info",
      label: "Informations personnelles",
      icon: <FaUser />,
      visible: true, // Visible pour tous les utilisateurs
    },
    {
      id: "complaints",
      label: "Voir les réclamations",
      icon: <FaListAlt />,
      visible: true, // Visible pour tous les utilisateurs
    },

    {
      id: "unenrollment-requests",
      label: "Demandes de désinscription",
      icon: <FaUserMinus />,
      visible: isAdmin, // Visible uniquement pour les administrateurs
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex justify-between items-center">
        <h1
          className={`text-2xl font-medium ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Paramètres
        </h1>

        {/* Bouton pour ouvrir/fermer le menu sur mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md bg-richblack-700 text-white"
        >
          <FaBars />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu de navigation - version desktop */}
        <div
          className={`hidden lg:block ${
            menuOpen ? "w-64" : "w-16"
          } transition-all duration-300 ${
            darkMode ? "bg-richblack-800" : "bg-white"
          } rounded-lg shadow-md h-fit overflow-hidden`}
        >
          <div
            className={`flex justify-between items-center p-3 ${
              darkMode
                ? "bg-gradient-to-r from-richblack-700 to-richblack-800 border-b border-richblack-600"
                : "bg-gradient-to-r from-gray-50 to-white border-b border-gray-200"
            }`}
          >
            {menuOpen && (
              <span
                className={`font-medium ${
                  darkMode ? "text-richblack-5" : "text-gray-700"
                }`}
              >
                Menu
              </span>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-1.5 rounded-full ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600 hover:text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              } transition-all duration-200`}
            >
              {menuOpen ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
          </div>

          <nav className="p-2">
            <ul className="space-y-1">
              {menuItems
                .filter((item) => item.visible)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                        activeTab === item.id
                          ? darkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700"
                          : darkMode
                          ? "text-richblack-300 hover:bg-richblack-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`${
                          activeTab === item.id
                            ? darkMode
                              ? "bg-blue-500 text-white"
                              : "bg-blue-200 text-blue-700"
                            : darkMode
                            ? "bg-richblack-700 text-richblack-300"
                            : "bg-gray-100 text-gray-600"
                        } p-1.5 rounded-md transition-colors`}
                      >
                        {item.icon}
                      </div>
                      {menuOpen && (
                        <span
                          className={`${
                            activeTab === item.id ? "font-medium" : ""
                          } truncate`}
                        >
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        {/* Menu de navigation - version mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden w-full ${
                darkMode ? "bg-richblack-800" : "bg-white"
              } rounded-lg shadow-md overflow-hidden`}
            >
              <nav className="p-2">
                <ul className="space-y-1">
                  {menuItems
                    .filter((item) => item.visible)
                    .map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            activeTab === item.id
                              ? darkMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-700"
                              : darkMode
                              ? "text-richblack-300 hover:bg-richblack-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`${
                              activeTab === item.id
                                ? darkMode
                                  ? "bg-blue-500 text-white"
                                  : "bg-blue-200 text-blue-700"
                                : darkMode
                                ? "bg-richblack-700 text-richblack-300"
                                : "bg-gray-100 text-gray-600"
                            } p-1.5 rounded-md`}
                          >
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu de l'onglet actif */}
        <div
          className={`w-full ${
            darkMode ? "bg-richblack-800" : "bg-white"
          } rounded-lg p-4 md:p-6 shadow-md`}
        >
          {activeTab === "personal-info" && (
            <div className="space-y-8">
              <ChangeProfilePicture />
              <EditProfile />
              <UpdatePassword />
            </div>
          )}

          {activeTab === "complaints" && isAdmin && <AdminComplaints />}

          {activeTab === "complaints" && !isAdmin && (
            <UserComplaints onNavigateToSubmit={handleNavigateToSubmit} />
          )}

          {activeTab === "submit-complaint" && !isAdmin && (
            <SubmitComplaint onNavigateBack={handleNavigateBackToComplaints} />
          )}

          {activeTab === "unenrollment-requests" && isAdmin && (
            <AdminUnenrollmentRequests />
          )}
        </div>
      </div>
    </div>
  );
}
