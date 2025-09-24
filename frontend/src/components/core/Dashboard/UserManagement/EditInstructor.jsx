import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import IconBtn from "../../../common/IconBtn";
import { FaArrowLeft } from "react-icons/fa";
import { apiConnector } from "../../../../services/apiConnector";
import ConfirmationModal from "../../../common/ConfirmationModal";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function EditInstructor() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const { instructorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    active: true,
    approved: false,
    ecole: "",
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const fetchInstructorDetails = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "GET",
        `${BASE_URL}/admin/users/${instructorId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        const instructor = response.data.data;
        setFormData({
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          email: instructor.email,
          // Récupérer contactNumber depuis additionalDetails
          contactNumber: instructor.additionalDetails?.contactNumber || "",
          active: instructor.active,
          approved: instructor.approved,
          ecole: instructor.additionalDetails?.ecole || "",
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de formateur:",
        error
      );
      toast.error("Impossible de charger les détails de formateur");
      navigate("/dashboard/instructors");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (instructorId) {
      fetchInstructorDetails();
    }
  }, [instructorId]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({
      ...resetPasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Créer un objet avec la structure attendue par le backend
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        active: formData.active,
        approved: formData.approved,
        additionalDetails: {
          contactNumber: formData.contactNumber,
          ecole: formData.ecole,
        },
      };

      const response = await apiConnector(
        "PUT",
        `${BASE_URL}/admin/users/${instructorId}`,
        dataToSend,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Formateur mis à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de formateur:", error);
      toast.error("Erreur lors de la mise à jour de formateur");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Vérifier si les mots de passe correspondent
    if (
      resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword
    ) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const response = await apiConnector(
        "PUT",
        `${BASE_URL}/admin/users/${instructorId}/reset-password`,
        { newPassword: resetPasswordData.newPassword },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Mot de passe réinitialisé avec succès");
        setResetPasswordData({
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      toast.error("Erreur lors de la réinitialisation du mot de passe");
    }
    setLoading(false);
  };

  const handleApproveInstructor = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "PUT",
        `${BASE_URL}/admin/instructors/${instructorId}/approve`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        toast.success("Formateur approuvé avec succès");
        setFormData({
          ...formData,
          approved: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation de formateur:", error);
      toast.error("Erreur lors de l'approbation de formateur");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconBtn
          text="Retour"
          onClick={() => navigate("/dashboard/instructors")}
          customClasses={`${
            darkMode
              ? "bg-richblack-700 hover:bg-richblack-600 text-richblack-50"
              : "bg-richblack-100 hover:bg-richblack-200 text-richblack-800"
          }`}
        >
          <FaArrowLeft />
        </IconBtn>
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Modifier formateur
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {/* Formulaire de modification des informations */}
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-4 p-6 border rounded-lg ${
              darkMode
                ? "border-richblack-700 bg-richblack-800"
                : "border-richblack-200 bg-white shadow-md"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Informations de formateur
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="firstName"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
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
                    darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lastName"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
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
                    darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className={darkMode ? "text-richblack-5" : "text-richblack-600"}
              >
                Email *
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
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contactNumber"
                className={darkMode ? "text-richblack-5" : "text-richblack-600"}
              >
                Numéro de téléphone
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
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                }`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="ecole"
                className={darkMode ? "text-richblack-5" : "text-richblack-600"}
              >
                École
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
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                }`}
                placeholder="Nom de l'école"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className={`w-4 h-4 rounded transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 border-richblack-600 checked:bg-blue-500"
                      : "bg-richblack-5 border-richblack-200 checked:bg-blue-500"
                  }`}
                />
                <label
                  htmlFor="active"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
                >
                  Compte actif
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approved"
                  name="approved"
                  checked={formData.approved}
                  onChange={handleChange}
                  className={`w-4 h-4 rounded transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 border-richblack-600 checked:bg-green-500"
                      : "bg-richblack-5 border-richblack-200 checked:bg-green-500"
                  }`}
                />
                <label
                  htmlFor="approved"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
                >
                  Approuvé
                </label>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mt-4">
              {!formData.approved && (
                <IconBtn
                  text="Approuver le formateur"
                  onClick={handleApproveInstructor}
                  disabled={loading}
                  customClasses={`${
                    darkMode
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } transition-all duration-200`}
                />
              )}
              <IconBtn
                text="Mettre à jour"
                type="submit"
                disabled={loading}
                customClasses={`${
                  darkMode
                    ? "bg-yellow-50 hover:bg-yellow-100 text-black"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                } transition-all duration-200`}
              />
            </div>
          </form>

          {/* Formulaire de réinitialisation du mot de passe */}
          <form
            onSubmit={handleResetPassword}
            className={`flex flex-col gap-4 p-6 border rounded-lg mt-6 ${
              darkMode
                ? "border-richblack-700 bg-richblack-800"
                : "border-richblack-200 bg-white shadow-md"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Réinitialiser le mot de passe
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="newPassword"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
                >
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={resetPasswordData.newPassword}
                  onChange={handleResetPasswordChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmNewPassword"
                  className={
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }
                >
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={resetPasswordData.confirmNewPassword}
                  onChange={handleResetPasswordChange}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <IconBtn
                text="Réinitialiser le mot de passe"
                type="submit"
                disabled={loading}
                customClasses={`${
                  darkMode
                    ? "bg-pink-600 hover:bg-pink-700 text-white"
                    : "bg-pink-500 hover:bg-pink-500 text-white "
                } transition-all duration-200`}
              />
            </div>
          </form>
        </>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}
