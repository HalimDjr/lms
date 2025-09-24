import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import IconBtn from "../../../common/IconBtn";
import { FaArrowLeft, FaUserShield } from "react-icons/fa";
import { MdEmail, MdPhone, MdLock, MdSecurity } from "react-icons/md";
import { apiConnector } from "../../../../services/apiConnector";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function AddAdmin() {
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
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
          accountType: "Admin",
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Administrateur créé avec succès");
        navigate("/dashboard/admins");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'administrateur:", error);
      toast.error("Erreur lors de la création de l'administrateur");
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
          onClick={() => navigate("/dashboard/admins")}
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
          Ajouter un administrateur
        </h1>
      </div>

      {/* Form card with enhanced styling */}
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
        <div
          className="flex items-center gap-4 mb-4 pb-4 border-b ${
          darkMode ? 'border-richblack-700' : 'border-richblack-100'
        }"
        >
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
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-700"
              }`}
            >
              Nouvel administrateur
            </h2>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              }`}
            >
              Créez un compte administrateur avec des privilèges complets
            </p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3
            className={`text-md font-medium flex items-center gap-2 ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            <MdSecurity className="text-lg" /> Informations personnelles
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
                  darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
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
                  darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
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
            className={`text-md font-medium flex items-center gap-2 ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            <MdEmail className="text-lg" /> Informations de contact
          </h3>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className={`font-medium ${
                darkMode ? "text-richblack-5" : "text-richblack-600"
              }`}
            >
              Email *
            </label>
            <div
              className={`relative rounded-lg overflow-hidden ${
                darkMode
                  ? "shadow-sm shadow-richblack-600"
                  : "shadow-sm shadow-richblack-300"
              }`}
            >
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg p-3 pl-10 transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
                } border`}
                required
                placeholder="exemple@email.com"
              />
              <MdEmail
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-richblack-300" : "text-richblack-400"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="contactNumber"
              className={`font-medium ${
                darkMode ? "text-richblack-5" : "text-richblack-600"
              }`}
            >
              Numéro de téléphone
            </label>
            <div
              className={`relative rounded-lg overflow-hidden ${
                darkMode
                  ? "shadow-sm shadow-richblack-600"
                  : "shadow-sm shadow-richblack-300"
              }`}
            >
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full rounded-lg p-3 pl-10 transition-all duration-200 ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
                } border`}
                placeholder="Ex: +33 6 12 34 56 78"
              />
              <MdPhone
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-richblack-300" : "text-richblack-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          <h3
            className={`text-md font-medium flex items-center gap-2 ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            <MdLock className="text-lg" /> Sécurité
          </h3>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700/50" : "bg-blue-50"
            }`}
          >
            <p
              className={`text-sm mb-4 ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Créez un mot de passe sécurisé avec au moins 8 caractères,
              incluant des lettres majuscules, minuscules et des chiffres.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className={`font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full rounded-lg p-3 transition-all duration-200 ${
                      darkMode
                        ? "bg-richblack-800 text-richblack-5 border-richblack-600"
                        : "bg-white text-richblack-800 border-richblack-200"
                    } focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
                    } border`}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className={`font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full rounded-lg p-3 transition-all duration-200 ${
                      darkMode
                        ? "bg-richblack-800 text-richblack-5 border-richblack-600"
                        : "bg-white text-richblack-800 border-richblack-200"
                    } focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500"
                    } border`}
                    required
                    placeholder="••••••••"
                  />
                </div>
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
            onClick={() => navigate("/dashboard/admins")}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${
              darkMode
                ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                : "bg-richblack-100 text-richblack-600 hover:bg-richblack-200"
            }`}
          >
            Annuler
          </button>
          <IconBtn
            text="Créer l'administrateur"
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
