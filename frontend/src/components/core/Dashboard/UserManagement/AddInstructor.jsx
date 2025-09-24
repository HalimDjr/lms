import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import IconBtn from "../../../common/IconBtn";
import { FaArrowLeft, FaChalkboardTeacher, FaSchool } from "react-icons/fa";
import { MdEmail, MdPhone, MdLock, MdVerified } from "react-icons/md";
import { apiConnector } from "../../../../services/apiConnector";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function AddInstructor() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    approved: false,
    ecole: "",
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        `${BASE_URL}/admin/users`,
        {
          ...formData,
          accountType: "Instructor",
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Formateur créé avec succès");
        navigate("/dashboard/instructors");
      }
    } catch (error) {
      console.error("Erreur lors de la création de formateur:", error);
      toast.error("Erreur lors de la création de formateur");
    }
    setLoading(false);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col gap-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <IconBtn
          text="Retour"
          onClick={() => navigate("/dashboard/instructors")}
          variant="secondary"
          size="medium"
        >
          <FaArrowLeft />
        </IconBtn>
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Ajouter un formateur
        </h1>
      </div>

      {/* Form card */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        onSubmit={handleSubmit}
        className={`flex flex-col gap-6 p-8 border rounded-xl ${
          darkMode
            ? "border-richblack-700 bg-richblack-800 shadow-lg shadow-richblack-900/40"
            : "border-richblack-200 bg-white shadow-lg shadow-richblack-400/10"
        }`}
      >
        {/* Form header with icon */}
        <div className="flex items-center gap-3 mb-2">
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
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-richblack-5" : "text-richblack-700"
            }`}
          >
            Informations de formateur
          </h2>
        </div>

        {/* Form sections */}
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3
              className={`text-md font-medium ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              } border-b ${
                darkMode ? "border-richblack-700" : "border-richblack-100"
              } pb-2`}
            >
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="firstName"
                  className={`font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                  } border`}
                  required
                  placeholder="Entrez le prénom"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lastName"
                  className={`font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                  } border`}
                  required
                  placeholder="Entrez le nom"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3
              className={`text-md font-medium ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              } border-b ${
                darkMode ? "border-richblack-700" : "border-richblack-100"
              } pb-2`}
            >
              Informations de contact
            </h3>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className={`font-medium flex items-center gap-2 ${
                  darkMode ? "text-richblack-5" : "text-richblack-600"
                }`}
              >
                <MdEmail className="text-lg" /> Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg p-3 transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                } border`}
                required
                placeholder="exemple@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contactNumber"
                className={`font-medium flex items-center gap-2 ${
                  darkMode ? "text-richblack-5" : "text-richblack-600"
                }`}
              >
                <MdPhone className="text-lg" /> Numéro de téléphone
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full rounded-lg p-3 transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                } border`}
                placeholder="Ex: +33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-4">
            <h3
              className={`text-md font-medium ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              } border-b ${
                darkMode ? "border-richblack-700" : "border-richblack-100"
              } pb-2`}
            >
              Sécurité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className={`font-medium flex items-center gap-2 ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <MdLock className="text-lg" /> Mot de passe *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                  } border`}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className={`font-medium flex items-center gap-2 ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <MdLock className="text-lg" /> Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                  } border`}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3
              className={`text-md font-medium ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              } border-b ${
                darkMode ? "border-richblack-700" : "border-richblack-100"
              } pb-2`}
            >
              Informations supplémentaires
            </h3>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="ecole"
                className={`font-medium flex items-center gap-2 ${
                  darkMode ? "text-richblack-5" : "text-richblack-600"
                }`}
              >
                <FaSchool className="text-lg" /> École
              </label>
              <input
                type="text"
                id="ecole"
                name="ecole"
                value={formData.ecole}
                onChange={handleChange}
                className={`w-full rounded-lg p-3 transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-yellow-50" : "focus:ring-yellow-500"
                } border`}
                placeholder="Nom de l'école"
              />
            </div>

            <div
              className="flex items-center gap-3 p-4 rounded-lg ${
              darkMode ? 'bg-richblack-700' : 'bg-yellow-50'
            }"
            >
              <input
                type="checkbox"
                id="approved"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className={`w-5 h-5 rounded transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 checked:bg-green-500"
                    : "bg-richblack-5 border-richblack-200 checked:bg-green-500"
                }`}
              />
              <div>
                <label
                  htmlFor="approved"
                  className={`font-medium flex items-center gap-2 ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  <MdVerified
                    className={`text-lg ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  Approuver immédiatement
                </label>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-500"
                  }`}
                >
                  formateur pourra accéder à la plateforme sans validation
                  supplémentaire
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div
          className="flex justify-end gap-4 mt-6 pt-4 border-t ${
          darkMode ? 'border-richblack-700' : 'border-richblack-100'
        }"
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard/instructors")}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${
              darkMode
                ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                : "bg-richblack-100 text-richblack-600 hover:bg-richblack-200"
            }`}
          >
            Annuler
          </button>
          <IconBtn
            text="Créer formateur"
            type="submit"
            disabled={loading}
            variant="primary"
            size="medium"
            loading={loading}
          />
        </div>
      </motion.form>
    </motion.div>
  );
}
