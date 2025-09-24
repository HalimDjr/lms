// src/components/core/Dashboard/InstructorCourses/QuizResults.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaFileDownload } from "react-icons/fa";
import {
  getQuizResults,
  getQuizDetails,
} from "../../../../services/operations/quizAPI";
import Loading from "../../../common/Loading";

export default function QuizResults() {
  const { quizId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme) || {
    darkMode: false,
  };
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "score",
    direction: "desc",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les détails du quiz
        const quizResponse = await getQuizDetails(quizId, token);
        if (quizResponse?.data) {
          setQuiz(quizResponse.data);
        }

        // Récupérer les résultats du quiz
        const resultsResponse = await getQuizResults(quizId, token);
        if (resultsResponse?.data) {
          setResults(resultsResponse.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, token]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortConfig.key === "user") {
      const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
      const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
      return sortConfig.direction === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredResults = sortedResults.filter((result) => {
    const fullName =
      `${result.user.firstName} ${result.user.lastName}`.toLowerCase();
    const email = result.user.email.toLowerCase();
    const term = searchTerm.toLowerCase();

    return fullName.includes(term) || email.includes(term);
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const exportToCSV = () => {
    if (!results.length) return;

    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Score",
      "Réussite",
      "Temps",
      "Date",
    ];

    const csvData = results.map((result) => [
      result.user.lastName,
      result.user.firstName,
      result.user.email,
      result.score,
      result.passed ? "Oui" : "Non",
      formatDuration(result.timeTaken),
      formatDate(result.endTime),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `resultats_quiz_${quiz.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loading />;
  }

  if (!quiz) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-60 ${
          darkMode ? "text-richblack-300" : "text-gray-600"
        }`}
      >
        <p className="text-xl">Quiz non trouvé</p>
        <button
          onClick={() => navigate("/dashboard/instructor-quizzes")}
          className={`mt-4 flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <FaArrowLeft />
          Retour aux quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard/instructor-quizzes")}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <FaArrowLeft />
          Retour aux quiz
        </button>

        <button
          onClick={exportToCSV}
          disabled={!results.length}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            results.length
              ? darkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
              : darkMode
              ? "bg-richblack-500 text-richblack-300 cursor-not-allowed"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FaFileDownload />
          Exporter CSV
        </button>
      </div>

      <div
        className={`rounded-lg p-6 border ${
          darkMode
            ? "bg-richblack-800 border-richblack-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <h1
          className={`text-3xl font-medium mb-2 ${
            darkMode ? "text-richblack-5" : "text-gray-800"
          }`}
        >
          {quiz.title}
        </h1>
        {quiz.description && (
          <p
            className={`mb-4 ${
              darkMode ? "text-richblack-300" : "text-gray-500"
            }`}
          >
            {quiz.description}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-3 rounded-md ${
              darkMode ? "bg-richblack-700" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Durée
            </p>
            <p
              className={`text-lg ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              {quiz.duration} minutes
            </p>
          </div>

          <div
            className={`p-3 rounded-md ${
              darkMode ? "bg-richblack-700" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Points totaux
            </p>
            <p
              className={`text-lg ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              {quiz.totalPoints}
            </p>
          </div>

          <div
            className={`p-3 rounded-md ${
              darkMode ? "bg-richblack-700" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Points pour réussir
            </p>
            <p
              className={`text-lg ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              {quiz.passingPoints}
            </p>
          </div>

          <div
            className={`p-3 rounded-md ${
              darkMode ? "bg-richblack-700" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Participants
            </p>
            <p
              className={`text-lg ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              {results.length}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg p-6 border ${
          darkMode
            ? "bg-richblack-800 border-richblack-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-medium ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Résultats des participants
          </h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un participant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-1 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 focus:ring-yellow-50"
                  : "bg-gray-100 text-gray-800 focus:ring-blue-500"
              }`}
            />
            <FaSearch
              className={`absolute left-3 top-3 ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            />
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <p
              className={`text-xl ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Aucun participant n'a encore passé cet examen
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    className={`text-left ${
                      darkMode ? "bg-richblack-700" : "bg-gray-100"
                    }`}
                  >
                    <th
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "hover:bg-richblack-600"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleSort("user")}
                    >
                      <span
                        className={
                          darkMode ? "text-richblack-50" : "text-gray-700"
                        }
                      >
                        Participant
                        {sortConfig.key === "user" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                    <th
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "hover:bg-richblack-600"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleSort("score")}
                    >
                      <span
                        className={
                          darkMode ? "text-richblack-50" : "text-gray-700"
                        }
                      >
                        Score
                        {sortConfig.key === "score" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                    <th
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "hover:bg-richblack-600"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleSort("passed")}
                    >
                      <span
                        className={
                          darkMode ? "text-richblack-50" : "text-gray-700"
                        }
                      >
                        Réussite
                        {sortConfig.key === "passed" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                    <th
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "hover:bg-richblack-600"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleSort("timeTaken")}
                    >
                      <span
                        className={
                          darkMode ? "text-richblack-50" : "text-gray-700"
                        }
                      >
                        Temps
                        {sortConfig.key === "timeTaken" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                    <th
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "hover:bg-richblack-600"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleSort("endTime")}
                    >
                      <span
                        className={
                          darkMode ? "text-richblack-50" : "text-gray-700"
                        }
                      >
                        Date
                        {sortConfig.key === "endTime" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr
                      key={result._id}
                      className={`border-b ${
                        darkMode
                          ? "border-richblack-700 hover:bg-richblack-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p
                            className={`font-medium ${
                              darkMode ? "text-richblack-5" : "text-gray-800"
                            }`}
                          >
                            {result.user.firstName} {result.user.lastName}
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-richblack-300" : "text-gray-500"
                            }`}
                          >
                            {result.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-medium ${
                            darkMode ? "text-richblack-5" : "text-gray-800"
                          }`}
                        >
                          {result.score} / {quiz.totalPoints}
                        </span>
                        <span
                          className={`text-sm ml-2 ${
                            darkMode ? "text-richblack-300" : "text-gray-500"
                          }`}
                        >
                          ({Math.round((result.score / quiz.totalPoints) * 100)}
                          %)
                        </span>
                      </td>
                      <td className="p-3">
                        <span
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
                        </span>
                      </td>
                      <td
                        className={`p-3 ${
                          darkMode ? "text-richblack-5" : "text-gray-800"
                        }`}
                      >
                        {formatDuration(result.timeTaken)}
                      </td>
                      <td
                        className={`p-3 ${
                          darkMode ? "text-richblack-5" : "text-gray-800"
                        }`}
                      >
                        {formatDate(result.endTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`mt-4 text-sm ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Affichage de {filteredResults.length} sur {results.length}{" "}
              résultats
            </div>
          </>
        )}
      </div>
    </div>
  );
}
