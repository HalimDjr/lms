// components/core/Dashboard/Complaints/SubmitComplaint.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

import { submitComplaint } from "../../../../services/operations/complaintAPI";

export default function SubmitComplaint({ onNavigateBack }) {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.subject.trim() ||
      !formData.description.trim() ||
      !formData.category
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitComplaint(formData, token);

      if (response.success) {
        // Si onNavigateBack est fourni, l'utiliser pour revenir à UserComplaints
        if (onNavigateBack) {
          onNavigateBack();
        } else {
          // Sinon, utiliser la navigation standard
          navigate("/dashboard/complaints");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la réclamation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: "technique", label: "Problème technique" },
    { value: "contenu", label: "Contenu du cours" },
    { value: "utilisateur", label: "Problème avec un utilisateur" },
    { value: "autre", label: "Autre" },
  ];

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Bouton pour revenir à UserComplaints */}
          <button
            onClick={onNavigateBack}
            className={`p-2 rounded-lg ${
              darkMode
                ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600 hover:text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            } transition-colors`}
            title="Retour aux réclamations"
          >
            <FaArrowLeft className="text-sm" />
          </button>

          <h1
            className={`text-xl font-semibold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Soumettre une réclamation
          </h1>
        </div>
      </div>

      <div
        className={`rounded-lg ${
          darkMode ? "bg-richblack-800" : "bg-white"
        } shadow-sm`}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Sujet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Sujet de votre réclamation"
              className={`w-full p-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-richblack-700 text-white border-richblack-600"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } border focus:ring-1 focus:outline-none ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
              required
            />
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-richblack-700 text-white border-richblack-600"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } border focus:ring-1 focus:outline-none ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre problème en détail..."
              rows="5"
              className={`w-full p-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-richblack-700 text-white border-richblack-600"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } border focus:ring-1 focus:outline-none ${
                darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
              }`}
              required
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Soumission...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-sm" />
                  <span>Soumettre la réclamation</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
