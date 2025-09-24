// frontend/src/components/core/Dashboard/InstructorCourses/QuestionForm.jsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function QuestionForm({
  question = null,
  onSubmit,
  onCancel,
  darkMode,
}) {
  const [formData, setFormData] = useState({
    text: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    points: 1,
  });

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        options: question.options,
        points: question.points,
      });
    }
  }, [question]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };

    // Si on définit une option comme correcte, les autres deviennent incorrectes
    if (field === "isCorrect" && value === true) {
      newOptions.forEach((option, i) => {
        if (i !== index) {
          option.isCorrect = false;
        }
      });
    }

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData({
        ...formData,
        options: [...formData.options, { text: "", isCorrect: false }],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = [...formData.options];
      newOptions.splice(index, 1);

      // S'assurer qu'au moins une option est correcte
      if (!newOptions.some((option) => option.isCorrect)) {
        newOptions[0].isCorrect = true;
      }

      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.text.trim()) {
      alert("Veuillez entrer le texte de la question");
      return;
    }

    if (!formData.options.some((option) => option.text.trim())) {
      alert("Veuillez entrer au moins une option valide");
      return;
    }

    if (!formData.options.some((option) => option.isCorrect)) {
      alert("Veuillez sélectionner au moins une option correcte");
      return;
    }

    onSubmit(formData);
  };

  // Définir les styles de base pour les champs de formulaire
  const inputStyles = darkMode
    ? "bg-richblack-700 text-white border-richblack-600 focus:border-yellow-50"
    : "bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500";

  return (
    <div
      className={`space-y-8 rounded-md border-[1px] p-6 ${
        darkMode
          ? "border-richblack-700 bg-richblack-800"
          : "border-gray-200 bg-white"
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="text"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Question{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <textarea
            name="text"
            id="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Entrez votre question"
            className={`w-full rounded-md p-3 border resize-none min-h-[130px] ${inputStyles}`}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Options{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <div className="space-y-4">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-x-4">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(index, "text", e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className={`w-full rounded-md p-3 border flex-1 ${inputStyles}`}
                  required
                />

                <div className="flex items-center gap-x-4">
                  <label
                    className={`flex items-center gap-x-2 text-sm ${
                      darkMode ? "text-richblack-5" : "text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.isCorrect}
                      onChange={() =>
                        handleOptionChange(index, "isCorrect", true)
                      }
                      className={`h-4 w-4 ${
                        darkMode
                          ? "text-yellow-50 focus:ring-yellow-50 border-richblack-300"
                          : "text-blue-600 focus:ring-blue-500 border-gray-300"
                      }`}
                    />
                    Correcte
                  </label>

                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className={
                        darkMode
                          ? "text-pink-200 hover:text-pink-300"
                          : "text-pink-600 hover:text-pink-700"
                      }
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {formData.options.length < 8 && (
            <button
              type="button"
              onClick={addOption}
              className={
                darkMode
                  ? "flex items-center gap-x-2 text-yellow-50"
                  : "flex items-center gap-x-2 text-blue-600"
              }
            >
              <FaPlus size={16} />
              Ajouter une option
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="points"
            className={`text-sm ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Points{" "}
            <sup className={darkMode ? "text-pink-200" : "text-pink-500"}>
              *
            </sup>
          </label>
          <input
            type="number"
            name="points"
            id="points"
            value={formData.points}
            onChange={handleChange}
            min="1"
            className={`w-full rounded-md p-3 border ${inputStyles}`}
            required
          />
        </div>

        <div className="flex justify-end gap-x-2">
          <button
            type="button"
            onClick={onCancel}
            className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
              darkMode
                ? "bg-richblack-300 text-richblack-900"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {question ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}
