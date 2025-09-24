// frontend/src/components/core/Dashboard/StudentCourses/TakeQuiz.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
} from "react-icons/fi";

import {
  getQuizForStudent,
  submitQuiz,
} from "../../../../services/operations/quizAPI";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(new Date());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const response = await getQuizForStudent(quizId, token);
        if (response.alreadyTaken) {
          toast.success(
            "Vous avez déjà passé cet examen. Redirection vers vos résultats..."
          );
          navigate(`/dashboard/quiz/${quizId}/result`);
          return;
        }
        if (response.data) {
          setQuiz(response.data);
          setTimeLeft(response.data.duration * 60); // Convertir en secondes
          // Stocker l'ID de la tentative
          if (response.attemptId) {
            localStorage.setItem(`quiz_attempt_${quizId}`, response.attemptId);
          }
        }
      } catch (error) {
        console.log("Erreur lors de la récupération d'examen :", error);
        toast.error("Erreur lors de la récupération d'examen ");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, token, navigate]);

  // Ajoutez également un gestionnaire pour la fermeture de la page
  useEffect(() => {
    // Fonction pour gérer la fermeture de la page
    const handleBeforeUnload = (e) => {
      // Si l'utilisateur n'a pas encore soumis le quiz, afficher un message d'avertissement
      if (!isSubmitting && !showConfirmation) {
        e.preventDefault();
        e.returnValue =
          "Si vous quittez cette page, votre tentative sera enregistrée mais non complétée.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitting, showConfirmation]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Soumission d'examen en cours...");

    try {
      const response = await submitQuiz(
        {
          quizId,
          answers: Object.entries(answers).map(
            ([questionId, selectedOption]) => ({
              questionId,
              selectedOption,
            })
          ),
          startTime: startTime.toISOString(),
        },
        token
      );

      if (response) {
        toast.success("Examen soumis avec succès");
        navigate(`/dashboard/quiz/${quizId}/result`);
      }
    } catch (error) {
      toast.error("Erreur lors de la soumission d'examen");
      setIsSubmitting(false);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-500"; // Moins d'une minute
    if (timeLeft < 300) return "text-yellow-500"; // Moins de 5 minutes
    return darkMode ? "text-blue-400" : "text-blue-600";
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    const totalQuestions = quiz.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-screen ${
          darkMode ? "bg-richblack-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`w-16 h-16 border-4 rounded-full border-t-transparent animate-spin ${
            darkMode ? "border-blue-500" : "border-blue-600"
          }`}
        ></div>
        <p
          className={`mt-4 text-lg ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Chargement d'examen...
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-screen ${
          darkMode ? "bg-richblack-900" : "bg-gray-50"
        }`}
      >
        <FiAlertTriangle
          className={`text-5xl mb-4 ${
            darkMode ? "text-yellow-400" : "text-yellow-500"
          }`}
        />
        <h2
          className={`text-2xl font-bold mb-2 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Examen non trouvé
        </h2>
        <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          L'Examen que vous recherchez n'existe pas ou n'est pas disponible.
        </p>
        <button
          onClick={() => navigate(-1)}
          className={`px-6 py-2 rounded-lg font-medium ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-[#2364aa] text-white hover:bg-blue-700"
          }`}
        >
          Retour
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-richblack-900" : "bg-gray-50"}`}
    >
      {/* Header avec titre et timer */}
      <div
        className={`sticky top-0 z-10 ${
          darkMode ? "bg-richblack-800" : "bg-white"
        } shadow-md`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {quiz.title}
              </h1>
              {quiz.description && (
                <p
                  className={`mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {quiz.description}
                </p>
              )}
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-gray-100"
              }`}
            >
              <FiClock className={getTimeColor()} />
              <span className={`font-mono font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                Progression: {Object.keys(answers).length}/
                {quiz.questions.length} questions
              </span>
              <span className={darkMode ? "text-blue-400" : "text-blue-600"}>
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div
              className={`h-2 w-full rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation des questions */}
          <div
            className={`lg:w-1/4 ${
              darkMode ? "bg-richblack-800" : "bg-white"
            } p-4 rounded-xl shadow-sm`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Questions
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {quiz.questions.map((question, index) => (
                <button
                  key={question._id}
                  onClick={() => navigateToQuestion(index)}
                  className={`w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    currentQuestionIndex === index
                      ? darkMode
                        ? "bg-[#2364aa] text-white"
                        : "bg-[#2364aa] text-white"
                      : answers[question._id] !== undefined
                      ? darkMode
                        ? "bg-green-700/30 text-green-400 border border-green-700"
                        : "bg-green-100 text-green-800 border border-green-200"
                      : darkMode
                      ? "bg-richblack-700 text-gray-300 hover:bg-richblack-600"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${
                    darkMode ? "bg-richblack-700" : "bg-gray-100"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Non répondu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${
                    darkMode ? "bg-blue-600" : "bg-blue-600"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Question actuelle
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${
                    darkMode ? "bg-green-700/30" : "bg-green-100"
                  } ${
                    darkMode
                      ? "border border-green-700"
                      : "border border-green-200"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Répondu
                </span>
              </div>
            </div>
          </div>

          {/* Question actuelle */}
          <div className="lg:w-3/4">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl shadow-sm ${
                darkMode ? "bg-richblack-800" : "bg-white"
              } p-6`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Question {currentQuestionIndex + 1}
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-[#2364aa] text-white"
                  }`}
                >
                  {currentQuestion.points}{" "}
                  {currentQuestion.points > 1 ? "points" : "point"}
                </div>
              </div>
              <p
                className={`text-lg mb-6 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {currentQuestion.text}
              </p>

              {/* Options de réponse */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    onClick={() =>
                      handleAnswerChange(currentQuestion._id, optionIndex)
                    }
                    className={`flex items-center gap-x-3 p-4 rounded-lg cursor-pointer transition-all ${
                      answers[currentQuestion._id] === optionIndex
                        ? darkMode
                          ? "bg-blue-900/30 border border-blue-700"
                          : "bg-blue-50 border border-blue-200"
                        : darkMode
                        ? "bg-richblack-700 hover:bg-richblack-600 border border-richblack-600"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                        answers[currentQuestion._id] === optionIndex
                          ? darkMode
                            ? "border-blue-500 bg-blue-500"
                            : "border-blue-600 bg-blue-600"
                          : darkMode
                          ? "border-gray-500"
                          : "border-gray-400"
                      }`}
                    >
                      {answers[currentQuestion._id] === optionIndex && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span
                      className={`${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      } text-base`}
                    >
                      {option.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation entre questions */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    currentQuestionIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    darkMode
                      ? "bg-richblack-700 text-white hover:bg-richblack-600"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <FiArrowRight className="rotate-180" /> Précédent
                </button>
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      darkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-[#2364aa] text-white hover:bg-blue-700"
                    }`}
                  >
                    Suivant <FiArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      darkMode
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Terminer <FiCheckCircle />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md w-full rounded-xl p-6 ${
              darkMode ? "bg-richblack-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Confirmer la soumission
            </h3>
            <p
              className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Vous avez répondu à {Object.keys(answers).length} sur{" "}
              {quiz.questions.length} questions. Êtes-vous sûr de vouloir
              soumettre cet examen maintenant ?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-white hover:bg-richblack-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-[#2364aa] text-white hover:bg-blue-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Soumission..." : "Confirmer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
