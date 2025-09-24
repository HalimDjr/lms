// src/components/core/Dashboard/InstructorCourses/InstructorQuizzes.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdPublishedWithChanges, MdUnpublished } from "react-icons/md";
import {
  getInstructorQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../../../../services/operations/quizAPI";
import Loading from "../../../common/Loading";
import toast from "react-hot-toast";

export default function InstructorQuizzes() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const response = await getInstructorQuizzes(token);
        if (response?.data) {
          setQuizzes(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [token]);

  const handlePublishToggle = async (quiz) => {
    if (updatingStatus) return;

    setUpdatingStatus(true);
    const newPublishStatus = !quiz.publie;

    try {
      const response = await updateQuiz(
        quiz._id,
        { publie: newPublishStatus },
        token
      );

      if (response && response.success) {
        setQuizzes(
          quizzes.map((q) =>
            q._id === quiz._id ? { ...q, publie: newPublishStatus } : q
          )
        );

        toast.success(
          `Examen ${newPublishStatus ? "publié" : "dépublié"} avec succès`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de publication:",
        error
      );
      toast.error("Échec de la mise à jour du statut de publication");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Nouvelle fonction pour gérer la suppression d'un quiz
  const handleDeleteQuiz = async (quizId, quizTitle) => {
    // Éviter les clics multiples pendant la suppression
    if (deletingQuiz) return;

    // Demander confirmation avant suppression
    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'examen "${quizTitle}" ? Cette action est irréversible.`
    );

    if (!isConfirmed) return;

    setDeletingQuiz(true);
    try {
      const response = await deleteQuiz(quizId, token);

      if (response && response.success) {
        // Mettre à jour la liste des quiz en retirant celui qui vient d'être supprimé
        setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
        toast.success("Examen supprimé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du quiz:", error);
      toast.error("Échec de la suppression de l'examen");
    } finally {
      setDeletingQuiz(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1
          className={`text-3xl font-medium ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Mes Examens
        </h1>
        <button
          onClick={() => navigate("/dashboard/my-courses")}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-blue-400 text-white hover:bg-blue-300"
          }`}
        >
          Retour aux cours
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center h-60 rounded-md ${
            darkMode ? "bg-richblack-800" : "bg-gray-100"
          }`}
        >
          <FaClipboardQuestion
            size={50}
            className={darkMode ? "text-richblack-300" : "text-gray-500"}
            style={{ marginBottom: "1rem" }}
          />
          <p
            className={`text-xl ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Vous n'avez pas encore créé d'examen
          </p>
          <button
            onClick={() => navigate("/dashboard/my-courses")}
            className={`mt-4 flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white"
            }`}
          >
            Créer un examen pour un cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className={`rounded-lg overflow-hidden border transition-all duration-200 ${
                darkMode
                  ? "bg-richblack-800 border-richblack-700 hover:border-richblack-500"
                  : "bg-white border-gray-200 hover:border-gray-400 shadow-sm"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2
                    className={`text-xl font-semibold ${
                      darkMode ? "text-richblack-5" : "text-richblack-800"
                    }`}
                  >
                    {quiz.title}
                  </h2>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.publie
                        ? darkMode
                          ? "bg-green-900/30 text-green-400 border border-green-500/30"
                          : "bg-green-100 text-green-700 border border-green-200"
                        : darkMode
                        ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    {quiz.publie ? (
                      <>
                        <MdPublishedWithChanges size={14} />
                        <span>Publié</span>
                      </>
                    ) : (
                      <>
                        <MdUnpublished size={14} />
                        <span>Non publié</span>
                      </>
                    )}
                  </div>
                </div>

                <p
                  className={`text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  {quiz.description
                    ? quiz.description.substring(0, 100) +
                      (quiz.description.length > 100 ? "..." : "")
                    : "Pas de description"}
                </p>

                <div
                  className={`flex justify-between items-center text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>Durée: {quiz.duration} min</div>
                  <div>Points: {quiz.totalPoints}</div>
                </div>

                <div
                  className={`flex justify-between items-center text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>Questions: {quiz.questions?.length || 0}</div>
                  <div>Réussite: {quiz.passingPoints} pts</div>
                </div>

                <div
                  className={`flex justify-between items-center text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>Cours: {quiz.course?.courseName || "N/A"}</div>
                  <div>Participants: {quiz.participantsCount || 0}</div>
                </div>
              </div>

              <div
                className={`flex border-t ${
                  darkMode ? "border-richblack-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => navigate(`/dashboard/quiz/${quiz._id}/edit`)}
                  className={`flex-1 py-3 flex justify-center items-center gap-2 transition-all duration-200 ${
                    darkMode
                      ? "hover:bg-richblack-700 text-yellow-50"
                      : "hover:bg-gray-100 text-yellow-600"
                  }`}
                >
                  <FaEdit size={16} />
                </button>

                <button
                  onClick={() => handlePublishToggle(quiz)}
                  disabled={updatingStatus}
                  className={`flex-1 py-3 flex justify-center items-center gap-2 transition-all duration-200 border-l ${
                    darkMode
                      ? "hover:bg-richblack-700 text-richblack-5 border-richblack-700"
                      : "hover:bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {quiz.publie ? (
                    <>
                      <MdUnpublished
                        size={16}
                        className={
                          darkMode ? "text-yellow-400" : "text-yellow-400"
                        }
                      />
                    </>
                  ) : (
                    <>
                      <MdPublishedWithChanges
                        size={16}
                        className={
                          darkMode ? "text-green-400" : "text-green-600"
                        }
                      />
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    navigate(`/dashboard/quiz/${quiz._id}/results`)
                  }
                  className={`flex-1 py-3 flex justify-center items-center gap-2 transition-all duration-200 border-l ${
                    darkMode
                      ? "hover:bg-richblack-700 text-blue-100 border-richblack-700"
                      : "hover:bg-gray-100 text-blue-400 border-gray-200"
                  }`}
                >
                  <FaEye size={16} />
                </button>

                {/* Nouveau bouton pour supprimer le quiz */}
                <button
                  onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                  disabled={deletingQuiz}
                  className={`flex-1 py-3 flex justify-center items-center gap-2 transition-all duration-200 border-l ${
                    darkMode
                      ? "hover:bg-richblack-700 text-pink-200 border-richblack-700"
                      : "hover:bg-gray-100 text-pink-600 border-gray-200"
                  }`}
                >
                  <FaTrash
                    size={16}
                    className={darkMode ? "text-pink-400" : "text-red-600"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
