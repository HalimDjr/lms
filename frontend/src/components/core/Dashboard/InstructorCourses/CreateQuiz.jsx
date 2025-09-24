// frontend/src/components/core/Dashboard/InstructorCourses/CreateQuiz.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createQuiz } from "../../../../services/operations/quizAPI";

export default function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30, // 30 minutes par défaut
    totalPoints: 100,
    passingPoints: 60,
    publie: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.duration ||
      !formData.totalPoints ||
      !formData.passingPoints
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.passingPoints > formData.totalPoints) {
      toast.error("Le score minimum ne peut pas être supérieur au score total");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Création du quiz en cours...");

    try {
      const response = await createQuiz(
        {
          ...formData,
          courseId,
        },
        token,
        user
      );

      if (response) {
        toast.success("Quiz créé avec succès");
        navigate(`/dashboard/quiz/${response.data._id}/edit`);
      }
    } catch (error) {
      console.log("Erreur lors de la création du quiz:", error);
      toast.error("Erreur lors de la création du quiz");
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Définir les styles de base pour les champs de formulaire
  const inputStyles = darkMode
    ? "bg-richblack-700 text-white border-richblack-600 focus:border-yellow-50"
    : "bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-100";

  return (
    <div
      className={`space-y-8 rounded-md border-[1px] p-6 ${
        darkMode
          ? "border-richblack-700 bg-richblack-800"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      <h1
        className={`text-2xl font-semibold ${
          darkMode ? "text-richblack-5" : "text-richblack-800"
        }`}
      >
        Créer un examen final
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="title"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Titre de l'examen{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Entrez le titre de l'examen"
            className={`w-full rounded-md p-3 border ${inputStyles}`}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="description"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Entrez une description pour l'examen"
            className={`w-full rounded-md p-3 border resize-none min-h-[130px] ${inputStyles}`}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="duration"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Durée (en minutes){" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            className={`w-full rounded-md p-3 border ${inputStyles}`}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="totalPoints"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Score total{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <input
            type="number"
            name="totalPoints"
            id="totalPoints"
            value={formData.totalPoints}
            onChange={handleChange}
            min="1"
            className={`w-full rounded-md p-3 border ${inputStyles}`}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="passingPoints"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Score minimum pour réussir{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <input
            type="number"
            name="passingPoints"
            id="passingPoints"
            value={formData.passingPoints}
            onChange={handleChange}
            min="1"
            max={formData.totalPoints}
            className={`w-full rounded-md p-3 border ${inputStyles}`}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="publie"
            id="publie"
            checked={formData.publie}
            onChange={handleChange}
            className={`h-4 w-4 rounded ${
              darkMode
                ? "text-yellow-50 focus:ring-yellow-50 border-richblack-300"
                : "text-blue-600 focus:ring-blue-500 border-gray-300"
            }`}
          />
          <label
            htmlFor="publie"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Publier l'examen (visible pour les apprenants)
          </label>
        </div>

        <div className="flex justify-end gap-x-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/courses`)}
            className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
              darkMode
                ? "bg-richblack-300 text-richblack-900"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Création en cours..." : "Créer l'examen"}
          </button>
        </div>
      </form>
    </div>
  );
}
