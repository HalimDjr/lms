// components/core/Dashboard/Complaints/UserComplaints.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaPlus, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { getUserComplaints } from "../../../../services/operations/complaintAPI";

export default function UserComplaints({ onNavigateToSubmit }) {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const data = await getUserComplaints(token);
        setComplaints(data);
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
      case "utilisateur":
        return "Problème avec un utilisateur";
      case "autre":
        return "Autre";
      default:
        return category;
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
          Chargement des réclamations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex justify-between items-center">
        <h1
          className={`text-xl font-semibold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Mes réclamations
        </h1>

        <button
          onClick={onNavigateToSubmit}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}
        >
          <FaPlus className="text-xs" />
          <span>Nouvelle réclamation</span>
        </button>
      </div>

      {complaints.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-12 rounded-lg ${
            darkMode ? "bg-richblack-700" : "bg-gray-50"
          }`}
        >
          <FaExclamationTriangle
            className={`text-3xl mb-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <p
            className={`text-base font-medium ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Vous n'avez pas encore soumis de réclamation.
          </p>
          <button
            onClick={onNavigateToSubmit}
            className={`mt-3 px-4 py-1.5 rounded-lg text-sm ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition-colors`}
          >
            Soumettre une réclamation
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={darkMode ? "bg-richblack-700" : "bg-gray-50"}>
                <th
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Sujet
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider hidden md:table-cell`}
                >
                  Catégorie
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider hidden sm:table-cell`}
                >
                  Date
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Statut
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-richblack-700" : "divide-gray-200"
              }`}
            >
              {complaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className={`${
                    darkMode
                      ? "bg-richblack-800 hover:bg-richblack-700"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2">
                    <div
                      className={`text-xs font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {complaint.subject}
                    </div>
                    {complaint.adminResponse && (
                      <div
                        className={`mt-1 text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <strong>Réponse:</strong>{" "}
                        <span className="line-clamp-1">
                          {complaint.adminResponse}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <span
                      className={`text-xs ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {getCategoryText(complaint.category)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                    <span
                      className={`text-xs ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {format(new Date(complaint.createdAt), "dd/MM/yy", {
                        locale: fr,
                      })}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusBadge(
                        complaint.status
                      )}`}
                    >
                      {getStatusText(complaint.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
