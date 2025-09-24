import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  getSubSectionQuiz,
  submitSubSectionQuiz,
  getSubSectionQuizResult,
  checkQuizAvailability,
} from "../../../services/operations/quizAPI";

const SubSectionQuiz = ({
  subSectionId,
  onQuizComplete,
  onClose,
  showResults = false,
}) => {
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme) || {
    darkMode: false,
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        console.log("Chargement du quiz ou des résultats pour:", subSectionId);
        // Vérifier d'abord la disponibilité du quiz et s'il a été mis à jour
        const availabilityResponse = await checkQuizAvailability(
          subSectionId,
          token
        );
        console.log("Disponibilité du quiz:", availabilityResponse);
        if (availabilityResponse && availabilityResponse.success) {
          // Si le quiz a été mis à jour
          if (
            availabilityResponse.quizUpdated ||
            availabilityResponse.newVersionAvailable
          ) {
            toast.info(
              `Le quiz a été mis à jour avec de nouvelles questions (${availabilityResponse.previousQuestionCount} → ${availabilityResponse.currentQuestionCount}). Vous devez le repasser.`
            );
            // Charger le quiz pour le repasser
            const response = await getSubSectionQuiz(subSectionId, token);
            if (response?.success && response?.data) {
              setQuizData(response.data);
              setUserAnswers({}); // Réinitialiser les réponses
              setQuizResult(null); // Réinitialiser les résultats précédents
            } else {
              toast.error("Impossible de charger le quiz mis à jour");
              onClose?.();
            }
            setLoading(false);
            return;
          }
          // Si l'utilisateur a déjà complété le quiz et qu'il n'y a pas de nouvelles questions
          if (availabilityResponse.completed && !showResults) {
            // Récupérer les résultats précédents
            const resultResponse = await getSubSectionQuizResult(
              subSectionId,
              token
            );
            if (
              resultResponse &&
              resultResponse.success &&
              resultResponse.completed
            ) {
              setQuizResult(resultResponse.data);
              setLoading(false);
              return;
            }
          }
        }
        // Si showResults est true mais pas de résultat, afficher un message
        if (showResults) {
          console.log("Mode résultats mais aucun résultat trouvé");
          const resultResponse = await getSubSectionQuizResult(
            subSectionId,
            token
          );
          if (!resultResponse || !resultResponse.completed) {
            toast.error("Aucun résultat disponible");
            onClose?.();
          } else {
            setQuizResult(resultResponse.data);
          }
          setLoading(false);
          return;
        }
        // Sinon, récupérer le quiz pour le passer
        console.log("Chargement du quiz pour le passer");
        const response = await getSubSectionQuiz(subSectionId, token);
        if (response?.success && response?.data) {
          setQuizData(response.data);
        } else {
          toast.error("Impossible de charger le quiz");
          onClose?.();
        }
      } catch (error) {
        console.log("Erreur lors du chargement du quiz:", error);
        toast.error(error.message || "Erreur lors du chargement du quiz");
        onClose?.();
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [subSectionId, token, showResults]);

  // Ajout de la fonction manquante handleAnswerSelect
  const handleAnswerSelect = (questionId, optionId) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length !== quizData?.questions?.length) {
      toast.error("Veuillez répondre à toutes les questions");
      return;
    }
    setSubmitting(true);
    try {
      const answers = Object.entries(userAnswers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );
      const response = await submitSubSectionQuiz(
        subSectionId,
        { answers },
        token
      );
      if (response && response.success) {
        setQuizResult(response.data);
        toast.success("Quiz soumis avec succès");
        // Augmenter le délai à 5 secondes pour laisser le temps de voir le résultat
        setTimeout(() => {
          onQuizComplete();
        }, 5000);
      } else {
        toast.error(
          response?.message || "Erreur lors de la soumission du quiz"
        );
      }
    } catch (error) {
      console.log("Erreur lors de la soumission du quiz:", error);
      toast.error("Erreur lors de la soumission du quiz");
    } finally {
      setSubmitting(false);
    }
  };

  // Afficher les résultats si disponibles
  if (quizResult && (showResults || quizResult.completed)) {
    return (
      <div
        className={`rounded-lg p-6 overflow-auto max-h-[80vh] ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Résultats du Quiz
          </h2>
          {!showResults && (
            <button
              type="button"
              onClick={onClose}
              className={`${
                darkMode
                  ? "text-richblack-300 hover:text-richblack-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {/* Score Summary */}
        <div className="text-center mb-8">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              quizResult.score === quizResult.total
                ? "bg-green-500 bg-opacity-20"
                : quizResult.score >= quizResult.total / 2
                ? "bg-yellow-500 bg-opacity-20"
                : "bg-red-500 bg-opacity-20"
            }`}
          >
            <span
              className={`text-3xl font-bold ${
                quizResult.score === quizResult.total
                  ? "text-green-500"
                  : quizResult.score >= quizResult.total / 2
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {quizResult.score}/{quizResult.total}
            </span>
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            {quizResult.score === quizResult.total
              ? "Parfait !"
              : quizResult.score >= quizResult.total / 2
              ? "Bon travail !"
              : "Continuez à apprendre !"}
          </h3>
          <p
            className={`mb-6 ${
              darkMode ? "text-richblack-300" : "text-gray-500"
            }`}
          >
            Vous avez obtenu {quizResult.score} sur {quizResult.total} points.
          </p>
        </div>
        {/* Detailed Results */}
        <div className="space-y-6 mb-8">
          <h4
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Révision détaillée
          </h4>
          {quizResult.questions &&
            quizResult.questions.map((question, index) => {
              const userAnswer = quizResult.results?.find(
                (r) => r.questionId === question._id.toString()
              );
              return (
                <div
                  key={question._id}
                  className={`p-4 rounded-lg border ${
                    userAnswer?.isCorrect
                      ? "bg-green-500 bg-opacity-10 border-green-500"
                      : "bg-red-500 bg-opacity-10 border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        userAnswer?.isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {userAnswer?.isCorrect ? (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium mb-3 ${
                          darkMode ? "text-richblack-5" : "text-gray-800"
                        }`}
                      >
                        {index + 1}. {question.text}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isUserSelection =
                            userAnswer?.selectedOptionId ===
                            option._id.toString();
                          return (
                            <div
                              key={option._id}
                              className={`p-3 rounded-lg ${
                                option.isCorrect
                                  ? "bg-green-500 bg-opacity-10 border border-green-500"
                                  : isUserSelection
                                  ? "bg-red-500 bg-opacity-10 border border-red-500"
                                  : darkMode
                                  ? "bg-richblack-700"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`${
                                    option.isCorrect
                                      ? "text-green-500"
                                      : isUserSelection
                                      ? "text-red-500"
                                      : darkMode
                                      ? "text-richblack-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {option.text}
                                </span>
                                {option.isCorrect && (
                                  <span className="text-green-500 text-sm">
                                    (Réponse correcte)
                                  </span>
                                )}
                                {isUserSelection && !option.isCorrect && (
                                  <span className="text-red-500 text-sm">
                                    (Votre réponse)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        {/* Action Buttons */}
        {!showResults && (
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Fermer
            </button>
            <button
              onClick={onQuizComplete}
              className={`px-6 py-2 rounded-md transition-colors ${
                darkMode
                  ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
              }`}
            >
              Continuer
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[300px] ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            darkMode ? "border-yellow-50" : "border-[#2364aa]"
          }`}
        ></div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div
        className={`rounded-lg p-6 ${
          darkMode ? "bg-richblack-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Quiz de la leçon
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`${
              darkMode
                ? "text-richblack-300 hover:text-richblack-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <p className={darkMode ? "text-richblack-300" : "text-gray-500"}>
            Aucune question disponible pour ce quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-6 ${darkMode ? "bg-richblack-800" : "bg-white"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Quiz de la leçon
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`${
              darkMode
                ? "text-richblack-300 hover:text-richblack-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {quizData.questions.map((question, index) => (
          <div
            key={question._id}
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-900" : "bg-gray-50"
            }`}
          >
            <p
              className={`font-medium mb-4 ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              {index + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option._id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    userAnswers[question._id] === option._id
                      ? darkMode
                        ? "bg-yellow-900 text-yellow-50"
                        : "bg-[#2364aa]/20 text-[#2364aa]"
                      : darkMode
                      ? "bg-richblack-700 hover:bg-richblack-600"
                      : "bg-white hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option._id}
                    checked={userAnswers[question._id] === option._id}
                    onChange={() =>
                      handleAnswerSelect(question._id, option._id)
                    }
                    className="hidden"
                  />
                  <span className="ml-2">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              Object.keys(userAnswers).length !== quizData.questions.length
            }
            className={`px-4 py-2 rounded-lg ${
              Object.keys(userAnswers).length === quizData.questions.length
                ? darkMode
                  ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
                : darkMode
                ? "bg-richblack-700 text-richblack-300 cursor-not-allowed"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Envoi en cours..." : "Soumettre"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubSectionQuiz;
