// frontend/src/components/core/HomePage/InstructorApplicationForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { submitInstructorApplication } from "../../../services/operations/instructorApplicationAPI";
import { useSelector } from "react-redux";
import { FaTimes } from "react-icons/fa";

const InstructorApplicationForm = ({ onClose }) => {
  const { darkMode } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("=== SOUMISSION DU FORMULAIRE ===");
      console.log("Données du formulaire:", data);

      const formData = new FormData();

      // Ajouter tous les champs au FormData
      Object.keys(data).forEach((key) => {
        if (key === "cv") {
          if (data[key] && data[key][0]) {
            console.log("Fichier CV:", data[key][0]);
            // Utiliser simplement append sans spécifier le nom du fichier
            formData.append("cv", data[key][0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      // Log pour vérifier le contenu du FormData
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[0] === "cv" ? "Fichier PDF" : pair[1])
        );
      }

      const result = await submitInstructorApplication(formData);
      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div
        className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={24} />
        </button>

        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-richblack-800"
          }`}
        >
          Devenir formateur
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Prénom *
              </label>
              <input
                type="text"
                {...register("firstName", { required: "Le prénom est requis" })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Nom *
              </label>
              <input
                type="text"
                {...register("lastName", { required: "Le nom est requis" })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Email *
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Date de naissance */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Date de naissance *
              </label>
              <input
                type="date"
                {...register("dateOfBirth", {
                  required: "La date de naissance est requise",
                })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Genre */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Genre *
              </label>
              <select
                {...register("gender", { required: "Le genre est requis" })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              >
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* École */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                École/Institution *
              </label>
              <input
                type="text"
                {...register("school", { required: "L'école est requise" })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.school && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.school.message}
                </p>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                {...register("contactNumber", {
                  required: "Le numéro de téléphone est requis",
                })}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            {/* CV */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-richblack-600"
                }`}
              >
                CV (PDF) *
              </label>
              <div
                className={`flex items-center px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600 text-white"
                    : "bg-white border-gray-300 text-richblack-800"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  {...register("cv", {
                    required: "Le CV est requis",
                    validate: {
                      isPDF: (file) =>
                        !file[0] ||
                        file[0].type === "application/pdf" ||
                        "Le fichier doit être au format PDF",
                    },
                  })}
                  onChange={(e) => {
                    handleFileChange(e);
                    // Déclencher la validation
                    register("cv").onChange(e);
                  }}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className={`cursor-pointer px-4 py-1 rounded-md ${
                    darkMode
                      ? "bg-richblack-900 text-white"
                      : "bg-richblack-50 text-richblack-800"
                  }`}
                >
                  Parcourir
                </label>
                <span className="ml-3 truncate flex-1">
                  {fileName || "Aucun fichier sélectionné"}
                </span>
              </div>
              {errors.cv && (
                <p className="text-red-500 text-xs mt-1">{errors.cv.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 mr-2 rounded-md ${
                darkMode
                  ? "bg-richblack-700 text-white hover:bg-richblack-600"
                  : "bg-richblack-50 text-richblack-800 hover:bg-richblack-100"
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-100 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Envoi en cours..." : "Soumettre ma candidature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorApplicationForm;
