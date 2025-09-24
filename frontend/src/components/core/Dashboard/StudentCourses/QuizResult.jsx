import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaTrophy,
  FaSadTear,
  FaSignOutAlt,
} from "react-icons/fa";

import { getQuizResult } from "../../../../services/operations/quizAPI";
import { requestUnenrollment } from "../../../../services/operations/studentFeaturesAPI";

export default function QuizResult() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const response = await getQuizResult(quizId, token);
        if (response) {
          console.log("Structure complète du résultat:", response);
          setResult(response.data);
        }
      } catch (error) {
        console.log("Erreur lors de la récupération des résultats:", error);
        toast.error("Erreur lors de la récupération des résultats");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId, token, navigate]);

  const handleRequestUnenrollment = async () => {
    console.log("Données envoyées pour désinscription:", {
      courseId: result.courseId,
      quizId,
      reason,
      resultStructure: result,
    });
    if (!result || !result.courseId || !reason.trim()) {
      toast.error(
        "Veuillez fournir une raison pour votre demande de désinscription"
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestUnenrollment(
        {
          courseId: result.courseId,
          quizId,
          reason,
        },
        token
      );

      if (response.success) {
        toast.success(
          "Votre demande de désinscription a été soumise avec succès"
        );
        setShowConfirmModal(false);
        navigate("/dashboard/enrolled-courses");
      } else {
        throw new Error(
          response.message || "Échec de la demande de désinscription"
        );
      }
    } catch (error) {
      console.log("Erreur lors de la demande de désinscription:", error);
      toast.error("Erreur lors de la demande de désinscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-full py-20 ${
          darkMode ? "text-richblack-100" : "text-richblack-600"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <span>Chargement des résultats...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-full py-20 ${
          darkMode ? "text-richblack-100" : "text-richblack-600"
        }`}
      >
        <FaSadTear className="text-5xl mb-4 text-yellow-50" />
        <p className="text-xl">Résultats non trouvés</p>
        <button
          onClick={() => navigate(-1)}
          className={`mt-6 flex items-center gap-x-2 rounded-md ${
            darkMode
              ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
              : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
          } py-2 px-4 transition-colors`}
        >
          <FaArrowLeft /> Retour
        </button>
      </div>
    );
  }

  const percentage = (result.result.score / result.totalPoints) * 100;
  const isPassed = result.result.passed;

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={`max-w-4xl mx-auto py-8 px-4 ${
        darkMode ? "" : "text-richblack-800"
      }`}
    >
      {/* Header with results summary */}
      <motion.div
        variants={fadeIn}
        className={`rounded-xl overflow-hidden mb-8 ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        }`}
      >
        <div
          className={`p-8 text-center ${
            isPassed
              ? darkMode
                ? "bg-caribbeangreen-900/20"
                : "bg-green-50"
              : darkMode
              ? "bg-pink-900/20"
              : "bg-red-50"
          }`}
        >
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <FaTrophy
                className={`text-6xl ${
                  darkMode ? "text-caribbeangreen-300" : "text-green-600"
                }`}
              />
            ) : (
              <FaSadTear
                className={`text-6xl ${
                  darkMode ? "text-pink-300" : "text-red-500"
                }`}
              />
            )}
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Résultats de l'examen
          </h1>

          <div
            className={`text-2xl font-semibold ${
              isPassed
                ? darkMode
                  ? "text-caribbeangreen-300"
                  : "text-green-600"
                : darkMode
                ? "text-pink-300"
                : "text-red-500"
            }`}
          >
            {isPassed
              ? "Félicitations! Vous avez réussi!"
              : "Vous n'avez pas obtenu le score minimum requis."}
          </div>

          <div
            className={`text-xl mt-2 ${
              darkMode ? "text-richblack-100" : "text-richblack-600"
            }`}
          >
            Score: {result.result.score} / {result.totalPoints} (
            {percentage.toFixed(1)}%)
          </div>

          <div
            className={`mt-2 text-sm ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            Score minimum requis: {result.passingPoints} points (
            {((result.passingPoints / result.totalPoints) * 100).toFixed(1)}%)
          </div>
        </div>

        <div
          className={`p-6 grid grid-cols-1 md:grid-cols-3 gap-4 ${
            darkMode ? "bg-richblack-800" : "bg-white"
          }`}
        >
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-richblack-5"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Questions totales
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {result.result.answers.length}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-richblack-5"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Réponses correctes
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-caribbeangreen-300" : "text-green-600"
              }`}
            >
              {result.result.answers.filter((a) => a.isCorrect).length}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-richblack-700" : "bg-richblack-5"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Réponses incorrectes
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-pink-300" : "text-red-500"
              }`}
            >
              {result.result.answers.filter((a) => !a.isCorrect).length}
            </p>
          </div>
        </div>

        {/* Bouton de demande de désinscription si l'étudiant a échoué */}
        {!isPassed &&
          (result.courseId ||
            (result.quiz && result.quiz.course && result.quiz.course._id)) && (
            <div
              className={`p-6 border-t ${
                darkMode ? "border-richblack-700" : "border-gray-200"
              }`}
            >
              <div className="text-center">
                <p
                  className={`mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  Vous n'avez pas obtenu le score minimum requis pour cet
                  examen. Vous pouvez demander à vous désinscrire du cours.
                </p>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className={`flex items-center gap-x-2 mx-auto rounded-lg py-3 px-6 font-semibold transition-colors ${
                    darkMode
                      ? "bg-pink-700 text-white hover:bg-pink-800"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Soumission...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt /> Demander une désinscription
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
      </motion.div>

      {/* Questions and answers */}
      <div className="space-y-6">
        {result.result.answers.map((answer, index) => (
          <motion.div
            key={answer.question._id}
            variants={fadeIn}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl ${
              answer.isCorrect
                ? darkMode
                  ? "border-caribbeangreen-300 bg-caribbeangreen-900/10"
                  : "border-green-200 bg-green-50"
                : darkMode
                ? "border-pink-300 bg-pink-900/10"
                : "border-red-200 bg-red-50"
            } border overflow-hidden`}
          >
            <div
              className={`p-4 flex justify-between items-center border-b ${
                answer.isCorrect
                  ? darkMode
                    ? "border-caribbeangreen-900/30"
                    : "border-green-100"
                  : darkMode
                  ? "border-pink-900/30"
                  : "border-red-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-richblack-5" : "text-richblack-800"
                }`}
              >
                Question {index + 1}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    answer.isCorrect
                      ? darkMode
                        ? "bg-caribbeangreen-900/30 text-caribbeangreen-300"
                        : "bg-green-100 text-green-700"
                      : darkMode
                      ? "bg-pink-900/30 text-pink-300"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </span>
                <span
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-600"
                  }`}
                >
                  {answer.question.points} points
                </span>
              </div>
            </div>

            <div className="p-6">
              <p
                className={`text-lg mb-4 ${
                  darkMode ? "text-richblack-100" : "text-richblack-700"
                }`}
              >
                {answer.question.text}
              </p>

              <div className="space-y-3">
                {answer.question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg flex items-center ${
                      optionIndex === answer.selectedOption && option.isCorrect
                        ? darkMode
                          ? "bg-caribbeangreen-900/20"
                          : "bg-green-100"
                        : optionIndex === answer.selectedOption
                        ? darkMode
                          ? "bg-pink-900/20"
                          : "bg-red-100"
                        : option.isCorrect
                        ? darkMode
                          ? "bg-caribbeangreen-900/10"
                          : "bg-green-50"
                        : darkMode
                        ? "bg-richblack-700"
                        : "bg-richblack-5"
                    }`}
                  >
                    <div className="mr-3">
                      {optionIndex === answer.selectedOption &&
                      option.isCorrect ? (
                        <FaCheckCircle
                          className={
                            darkMode
                              ? "text-caribbeangreen-300"
                              : "text-green-600"
                          }
                        />
                      ) : optionIndex === answer.selectedOption ? (
                        <FaTimesCircle
                          className={
                            darkMode ? "text-pink-300" : "text-red-500"
                          }
                        />
                      ) : option.isCorrect ? (
                        <FaCheckCircle
                          className={
                            darkMode
                              ? "text-caribbeangreen-300"
                              : "text-green-600"
                          }
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                      )}
                    </div>
                    <span
                      className={`${
                        optionIndex === answer.selectedOption
                          ? option.isCorrect
                            ? darkMode
                              ? "text-caribbeangreen-300"
                              : "text-green-700"
                            : darkMode
                            ? "text-pink-300"
                            : "text-red-700"
                          : option.isCorrect
                          ? darkMode
                            ? "text-caribbeangreen-300"
                            : "text-green-700"
                          : darkMode
                          ? "text-richblack-100"
                          : "text-richblack-700"
                      }`}
                    >
                      {option.text}
                      {optionIndex === answer.selectedOption &&
                        " (Votre réponse)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeIn} className="mt-8 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-x-2 rounded-lg py-3 px-6 font-semibold transition-colors ${
            darkMode
              ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
              : "bg-richblack-100 text-richblack-800 hover:bg-richblack-200"
          }`}
        >
          <FaArrowLeft /> Retour au cours
        </button>
      </motion.div>

      {/* Modal de demande de désinscription */}
      {showConfirmModal && (
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
              Demande de désinscription
            </h3>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Votre demande sera examinée par un administrateur. Veuillez
              expliquer pourquoi vous souhaitez vous désinscrire de ce cours.
            </p>

            <div className="mb-4">
              <label
                htmlFor="reason"
                className={`block mb-2 text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Raison de la désinscription{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Veuillez expliquer pourquoi vous souhaitez vous désinscrire..."
                className={`w-full p-3 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-white border-richblack-600"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } border focus:ring-2 focus:outline-none ${
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
                }`}
                required
              ></textarea>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-white hover:bg-richblack-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={handleRequestUnenrollment}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${!reason.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={submitting || !reason.trim()}
              >
                {submitting ? "Soumission..." : "Soumettre la demande"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
