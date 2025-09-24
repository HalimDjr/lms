// src/components/core/Dashboard/StudentCourses/StudentQuizzes.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaClipboard, FaEye, FaMedal } from "react-icons/fa";
import { getStudentQuizResults } from "../../../../services/operations/quizAPI";
import Loading from "../../../common/Loading";

export default function StudentQuizzes() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResults = async () => {
      setLoading(true);
      try {
        const response = await getStudentQuizResults(token);
        console.log("Résultats bruts des quiz:", response?.data);

        if (response?.data) {
          // Vérifier d'abord si les données sont valides
          const validResults = response.data.filter(
            (result) => result && result.quiz
          );

          // Ensuite filtrer les quiz publiés
          const publishedQuizzes = validResults.filter(
            (result) => result.quiz.publie
          );

          console.log("Quiz publiés filtrés:", publishedQuizzes);
          setQuizResults(publishedQuizzes);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des résultats d'examens:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [token]);

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
          onClick={() => navigate("/dashboard/enrolled-courses")}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-richblack-800 text-white"
          }`}
        >
          Retour aux cours
        </button>
      </div>

      {quizResults.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center h-60 rounded-md ${
            darkMode ? "bg-richblack-800" : "bg-gray-100"
          }`}
        >
          <FaClipboard
            size={50}
            className={darkMode ? "text-richblack-300" : "text-gray-500"}
            style={{ marginBottom: "1rem" }}
          />
          <p
            className={`text-xl ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Vous n'avez pas encore passé d'examen
          </p>
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className={`mt-4 flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white"
            }`}
          >
            Explorer mes cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizResults.map((result) => (
            <div
              key={result._id}
              className={`rounded-lg overflow-hidden border transition-all duration-200 ${
                darkMode
                  ? "bg-richblack-800 border-richblack-700 hover:border-richblack-500"
                  : "bg-white border-gray-200 hover:border-gray-400 shadow-sm"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2
                    className={`text-xl font-semibold ${
                      darkMode ? "text-richblack-5" : "text-richblack-800"
                    }`}
                  >
                    {result.quiz.title}
                  </h2>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.passed
                        ? darkMode
                          ? "bg-caribbeangreen-900/20 text-caribbeangreen-300"
                          : "bg-green-100 text-green-700"
                        : darkMode
                        ? "bg-pink-900/20 text-pink-300"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.passed ? "Réussi" : "Échoué"}
                  </div>
                </div>

                <p
                  className={`text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  Cours: {result.quiz.course?.courseName || "N/A"}
                </p>

                <div
                  className={`flex justify-between items-center text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>
                    Score: {result.score} / {result.quiz.totalPoints}
                  </div>
                  <div>
                    {Math.round((result.score / result.quiz.totalPoints) * 100)}
                    %
                  </div>
                </div>

                <div
                  className={`flex justify-between items-center text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>Temps: {formatDuration(result.timeTaken)}</div>
                  <div>Date: {formatDate(result.endTime)}</div>
                </div>

                <div
                  className={`flex items-center gap-2 text-sm ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <FaMedal
                    className={
                      result.passed
                        ? darkMode
                          ? "text-yellow-50"
                          : "text-yellow-500"
                        : darkMode
                        ? "text-richblack-400"
                        : "text-gray-400"
                    }
                  />
                  <span>
                    {result.passed
                      ? `Félicitations! Vous avez obtenu ${result.score} points.`
                      : `Il vous manquait ${
                          result.quiz.passingPoints - result.score
                        } points pour réussir.`}
                  </span>
                </div>
              </div>

              <div
                className={`border-t ${
                  darkMode ? "border-richblack-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() =>
                    navigate(`/dashboard/quiz/${result.quiz._id}/result`)
                  }
                  className={`w-full py-3 flex justify-center items-center gap-2 transition-all duration-200 ${
                    darkMode
                      ? "hover:bg-richblack-700 text-blue-100"
                      : "hover:bg-gray-100 text-blue-600"
                  }`}
                >
                  <FaEye size={16} />
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour formater la durée
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Fonction utilitaire pour formater la date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
