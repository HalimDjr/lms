// frontend/src/components/core/Dashboard/InstructorCourses/EditQuiz.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getQuizDetails,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../../../services/operations/quizAPI";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    totalPoints: 100,
    passingPoints: 60,
  });

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      try {
        const response = await getQuizDetails(quizId, token, user);
        if (response) {
          setQuiz(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description || "",
            duration: response.data.duration,
            totalPoints: response.data.totalPoints,
            passingPoints: response.data.passingPoints,
            publie: response.data.publie || false,
          });
        }
      } catch (error) {
        console.log(
          "Erreur lors de la récupération des détails du quiz:",
          error
        );
        toast.error("Erreur lors de la récupération des détails du quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId, token, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleUpdateQuiz = async (e) => {
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

    const toastId = toast.loading("Mise à jour du quiz en cours...");

    try {
      const response = await updateQuiz(quizId, formData, token, user);
      if (response) {
        setQuiz({
          ...quiz,
          ...formData,
        });
        toast.success("Quiz mis à jour avec succès");
      }
    } catch (error) {
      console.log("Erreur lors de la mise à jour du quiz:", error);
      toast.error("Erreur lors de la mise à jour du quiz");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleAddQuestion = async (questionData) => {
    const toastId = toast.loading("Ajout de la question en cours...");

    try {
      const response = await addQuestion(
        {
          ...questionData,
          quizId,
        },
        token,
        user
      );

      if (response) {
        setQuiz({
          ...quiz,
          questions: [...quiz.questions, response.data],
        });
        setShowQuestionForm(false);
        toast.success("Question ajoutée avec succès");
      }
    } catch (error) {
      console.log("Erreur lors de l'ajout de la question:", error);
      toast.error("Erreur lors de l'ajout de la question");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleUpdateQuestion = async (questionId, questionData) => {
    const toastId = toast.loading("Mise à jour de la question en cours...");

    try {
      const response = await updateQuestion(
        questionId,
        questionData,
        token,
        user
      );
      if (response) {
        setQuiz({
          ...quiz,
          questions: quiz.questions.map((q) =>
            q._id === questionId ? response.data : q
          ),
        });
        setEditingQuestion(null);
        toast.success("Question mise à jour avec succès");
      }
    } catch (error) {
      console.log("Erreur lors de la mise à jour de la question:", error);
      toast.error("Erreur lors de la mise à jour de la question");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const toastId = toast.loading("Suppression de la question en cours...");

    try {
      await deleteQuestion(questionId, token, user);
      setQuiz({
        ...quiz,
        questions: quiz.questions.filter((q) => q._id !== questionId),
      });
      toast.success("Question supprimée avec succès");
    } catch (error) {
      console.log("Erreur lors de la suppression de la question:", error);
      toast.error("Erreur lors de la suppression de la question");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Afficher des informations sur le cours associé au quiz (utile pour l'admin)
  const renderCourseInfo = () => {
    if (!quiz || !quiz.course) return null;

    return (
      <div
        className={`mb-4 p-3 rounded-md ${
          darkMode ? "bg-richblack-700" : "bg-gray-100"
        }`}
      >
        <p
          className={
            darkMode ? "text-sm text-richblack-300" : "text-sm text-gray-600"
          }
        >
          Cours associé:{" "}
          <span className={darkMode ? "text-yellow-50" : "text-blue-600"}>
            {quiz.course.courseName}
          </span>
          {user?.accountType === "Admin" && quiz.course.instructor && (
            <span className="ml-2">
              | Instructeur: {quiz.course.instructor.firstName}{" "}
              {quiz.course.instructor.lastName}
            </span>
          )}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Chargement...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-full">
        Quiz non trouvé
      </div>
    );
  }

  // Définir les styles de base pour les champs de formulaire
  const inputStyles = darkMode
    ? "bg-richblack-700 text-white border-richblack-600 focus:border-yellow-50"
    : "bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1
          className={`text-2xl font-semibold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Éditer l'examen final
        </h1>
        <button
          onClick={() => navigate(`/dashboard/courses`)}
          className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-richblack-800 text-white"
          }`}
        >
          Retour aux cours
        </button>
      </div>

      {/* Afficher les informations du cours (utile pour l'admin) */}
      {renderCourseInfo()}

      <div
        className={`rounded-md border-[1px] p-6 ${
          darkMode
            ? "border-richblack-700 bg-richblack-800"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Informations générales
        </h2>
        <form onSubmit={handleUpdateQuiz} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="title"
              className={`text-sm ${
                darkMode ? "text-richblack-5" : "text-gray-700"
              }`}
            >
              Titre de l'examen <sup className="text-pink-500">*</sup>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="duration"
                className={`text-sm ${
                  darkMode ? "text-richblack-5" : "text-gray-700"
                }`}
              >
                Durée (en minutes) <sup className="text-pink-500">*</sup>
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
                Score total <sup className="text-pink-500">*</sup>
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
                <sup className="text-pink-500">*</sup>
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
            <div className="flex items-center space-x-2 mt-4">
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
                darkMode
                  ? "bg-yellow-50 text-richblack-900"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Mettre à jour les informations
            </button>
          </div>
        </form>
      </div>

      <div
        className={`rounded-md border-[1px] p-6 ${
          darkMode
            ? "border-richblack-700 bg-richblack-800"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Questions ({quiz.questions.length})
          </h2>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setShowQuestionForm(!showQuestionForm);
            }}
            className={`flex items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showQuestionForm ? "Annuler" : "Ajouter une question"}
          </button>
        </div>

        {showQuestionForm && !editingQuestion && (
          <QuestionForm
            onSubmit={handleAddQuestion}
            onCancel={() => setShowQuestionForm(false)}
            darkMode={darkMode}
          />
        )}

        {editingQuestion && (
          <QuestionForm
            question={editingQuestion}
            onSubmit={(data) => handleUpdateQuestion(editingQuestion._id, data)}
            onCancel={() => setEditingQuestion(null)}
            darkMode={darkMode}
          />
        )}

        <div className="space-y-4 mt-6">
          {quiz.questions.length === 0 ? (
            <p
              className={`text-center ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Aucune question ajoutée
            </p>
          ) : (
            quiz.questions.map((question, index) => (
              <QuestionCard
                key={question._id}
                question={question}
                index={index}
                onEdit={() => setEditingQuestion(question)}
                onDelete={() => handleDeleteQuestion(question._id)}
                darkMode={darkMode}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
