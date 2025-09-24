import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiAward,
  FiCheckCircle,
} from "react-icons/fi";

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI";
import { getInstructorData } from "../../../services/operations/profileAPI";
import {
  getInstructorQuizzes,
  getQuizResults,
} from "../../../services/operations/quizAPI";
import {
  getCourseCertificates,
  getEligibleStudents,
} from "../../../services/operations/certificateAPI";
import InstructorChart from "./InstructorDashboard/InstructorChart";
import Img from "./../../common/Img";

export default function Instructor() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);

  const [loading, setLoading] = useState(false);
  const [instructorData, setInstructorData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    passRate: 0,
    averageScore: 0,
  });
  const [certStats, setCertStats] = useState({
    totalCertificates: 0,
    certificationRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Début de la récupération des données");
        // Récupérer les données existantes
        const instructorApiData = await getInstructorData(token);
        const result = await fetchInstructorCourses(token);

        // Mettre à jour les données des cours d'abord
        if (result) {
          setCourses(result);
        }

        // Mettre à jour les données de l'instructeur
        if (instructorApiData?.length) {
          setInstructorData(instructorApiData);
        }

        // Récupérer les statistiques des quiz
        console.log("Récupération des quiz de l'instructeur");
        const quizData = await getInstructorQuizzes(token);
        console.log("Quiz récupérés:", quizData);

        if (quizData?.success && quizData.data) {
          const quizzes = quizData.data;
          let totalAttempts = 0;
          let totalPassed = 0;
          let totalScorePercentage = 0;

          // Pour chaque quiz, récupérer les résultats détaillés
          for (const quiz of quizzes) {
            console.log(
              `Traitement du quiz ${quiz._id}, participants: ${quiz.participantsCount}`
            );
            if (quiz.participantsCount && quiz.participantsCount > 0) {
              try {
                console.log(
                  `Récupération des résultats pour le quiz ${quiz._id}`
                );
                const quizResults = await getQuizResults(quiz._id, token);
                console.log("Résultats récupérés:", quizResults);

                if (
                  quizResults?.success &&
                  quizResults.data &&
                  quizResults.data.length > 0
                ) {
                  quizResults.data.forEach((result) => {
                    totalAttempts++;
                    if (result.passed) {
                      totalPassed++;
                    }

                    // Calculer le pourcentage pour ce résultat
                    const totalPoints = quiz.totalPoints || 100; // Valeur par défaut si non disponible
                    const scorePercentage = (result.score / totalPoints) * 100;
                    totalScorePercentage += scorePercentage;

                    console.log(
                      `Score: ${result.score}/${totalPoints} = ${scorePercentage}%`
                    );
                  });
                }
              } catch (error) {
                console.error(
                  `Erreur lors de la récupération des résultats pour le quiz ${quiz._id}:`,
                  error
                );
              }
            }
          }

          console.log(
            `Total des tentatives: ${totalAttempts}, Réussites: ${totalPassed}, Score total: ${totalScorePercentage}`
          );

          // Mettre à jour les statistiques des quiz
          setQuizStats({
            totalQuizzes: quizzes.length,
            passRate:
              totalAttempts > 0
                ? ((totalPassed / totalAttempts) * 100).toFixed(1)
                : 0,
            averageScore:
              totalAttempts > 0
                ? (totalScorePercentage / totalAttempts).toFixed(1)
                : 0,
          });
        }

        // Récupérer les statistiques des certificats pour chaque cours
        console.log("Récupération des statistiques de certificats");
        if (result && result.length > 0) {
          let totalCerts = 0;
          let totalEligibleStudents = 0;

          for (const course of result) {
            try {
              // Récupérer les certificats déjà émis pour ce cours
              console.log(
                `Récupération des certificats pour le cours ${course._id}`
              );
              const certData = await getCourseCertificates(course._id, token, {
                accountType: user.accountType, // Ajout du type de compte
              });

              if (certData?.success && certData.data) {
                totalCerts += certData.data.length;
              }

              // Vérifier si le cours est certifiant avant de récupérer les étudiants éligibles
              if (course.isCertified) {
                console.log(
                  `Récupération des apprenants éligibles pour la formation ${course._id}`
                );
                const eligibleData = await getEligibleStudents(
                  course._id,
                  token,
                  {
                    accountType: user.accountType,
                  }
                );

                if (eligibleData?.success && eligibleData.data) {
                  totalEligibleStudents += eligibleData.data.length;
                }

                // Ajouter les certificats déjà émis au total des étudiants éligibles
                if (certData?.success && certData.data) {
                  totalEligibleStudents += certData.data.length;
                }
              }
            } catch (error) {
              console.error(`Erreur pour le cours ${course._id}:`, error);
            }
          }

          console.log(
            `Total des certificats: ${totalCerts}, Total des apprenants éligibles: ${totalEligibleStudents}`
          );

          // Mettre à jour les statistiques des certificats
          setCertStats({
            totalCertificates: totalCerts,
            certificationRate:
              totalEligibleStudents > 0
                ? ((totalCerts / totalEligibleStudents) * 100).toFixed(1)
                : 0,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const totalAmount =
    instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0) ||
    0;

  const totalStudents =
    instructorData?.reduce(
      (acc, curr) => acc + curr.totalStudentsEnrolled,
      0
    ) || 0;

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // skeleton loading
  const skItem = () => {
    return (
      <div className="mt-5 w-full flex flex-col justify-between rounded-xl">
        <div
          className={`flex border p-4 ${
            darkMode ? "border-richblack-600" : "border-richblack-200"
          }`}
        >
          <div className="w-full">
            <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            <div className="mt-3 flex gap-x-5">
              <p className="w-[200px] h-4 rounded-xl skeleton"></p>
              <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            </div>

            <div className="flex justify-center items-center flex-col">
              <div className="w-[80%] h-24 rounded-xl mt-5 skeleton"></div>
              {/* circle */}
              <div className="w-60 h-60 rounded-full mt-4 grid place-items-center skeleton"></div>
            </div>
          </div>
          {/* right column */}
          <div className="sm:flex hidden min-w-[250px] flex-col rounded-xl p-6 skeleton"></div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col gap-y-6 mt-5">
          <div className="flex justify-between">
            <p
              className={`text-lg font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              } pl-5`}
            >
              Vos formations
            </p>
            <Link to="/dashboard/my-courses">
              <p className="text-xs font-semibold text-blue-100 hover:underline pr-5">
                Tout afficher
              </p>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <p className="h-[201px] w-full rounded-xl skeleton"></p>
            <p className="h-[201px] w-full rounded-xl skeleton"></p>
            <p className="h-[201px] w-full rounded-xl skeleton"></p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div variants={fadeIn} className="space-y-2">
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          } text-center sm:text-left`}
        >
          Bienvenu {user?.firstName} 👨‍🏫
        </h1>
      </motion.div>

      {loading ? (
        <div>{skItem()}</div>
      ) : courses && courses.length > 0 ? (
        <div>
          <motion.div
            variants={fadeIn}
            className="my-6 grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Carte des cours */}
            <motion.div
              variants={fadeIn}
              className={`col-span-1 rounded-xl ${
                darkMode ? "bg-richblack-800" : "bg-white shadow-md"
              } p-6 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  formations
                </h3>
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-blue-900/30" : "bg-blue-50"
                  }`}
                >
                  <FiBook
                    className={darkMode ? "text-blue-400" : "text-blue-600"}
                    size={20}
                  />
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  darkMode ? "text-richblack-50" : "text-richblack-800"
                }`}
              >
                {courses.length}
              </p>
              <Link
                to="/dashboard/my-courses"
                className={`mt-auto text-sm flex items-center gap-1 ${
                  darkMode ? "text-blue-100" : "text-blue-600"
                } hover:underline`}
              >
                Voir tous les formations <FiArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Carte des apprenants */}
            <motion.div
              variants={fadeIn}
              className={`col-span-1 rounded-xl ${
                darkMode ? "bg-richblack-800" : "bg-white shadow-md"
              } p-6 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  Apprenants
                </h3>
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-green-900/30" : "bg-green-50"
                  }`}
                >
                  <FiUsers
                    className={darkMode ? "text-green-400" : "text-green-600"}
                    size={20}
                  />
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  darkMode ? "text-richblack-50" : "text-richblack-800"
                }`}
              >
                {totalStudents}
              </p>
              <p
                className={`mt-auto text-sm ${
                  darkMode ? "text-richblack-300" : "text-richblack-500"
                }`}
              >
                Inscrits à vos formations
              </p>
            </motion.div>

            {/* Nouvelle carte des examens */}
            <motion.div
              variants={fadeIn}
              className={`col-span-1 rounded-xl ${
                darkMode ? "bg-richblack-800" : "bg-white shadow-md"
              } p-6 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  Examens
                </h3>
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-yellow-900/30" : "bg-yellow-50"
                  }`}
                >
                  <FiCheckCircle
                    className={darkMode ? "text-yellow-400" : "text-yellow-600"}
                    size={20}
                  />
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  darkMode ? "text-richblack-50" : "text-richblack-800"
                }`}
              >
                {quizStats.totalQuizzes}
              </p>
              <div className="mt-2">
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-500"
                  }`}
                >
                  Taux de réussite: {quizStats.passRate}%
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-300" : "text-richblack-500"
                  }`}
                >
                  Score moyen: {quizStats.averageScore}%
                </p>
              </div>
            </motion.div>

            {/* Nouvelle carte des certifications */}
            <motion.div
              variants={fadeIn}
              className={`col-span-1 rounded-xl ${
                darkMode ? "bg-richblack-800" : "bg-white shadow-md"
              } p-6 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  Certifications
                </h3>
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-purple-900/30" : "bg-purple-50"
                  }`}
                >
                  <FiAward
                    className={darkMode ? "text-purple-400" : "text-purple-600"}
                    size={20}
                  />
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  darkMode ? "text-richblack-50" : "text-richblack-800"
                }`}
              >
                {certStats.totalCertificates}
              </p>
              <p
                className={`mt-auto text-sm ${
                  darkMode ? "text-richblack-300" : "text-richblack-500"
                }`}
              >
                Taux de certification: {certStats.certificationRate}%
              </p>
            </motion.div>
          </motion.div>

          {/* Section du graphique */}
          <motion.div variants={fadeIn} className="my-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {instructorData &&
              (instructorData.length > 0 || totalStudents > 0) ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div
                  className={`h-full rounded-xl ${
                    darkMode ? "bg-richblack-800" : "bg-white shadow-md"
                  } p-6 flex flex-col justify-center items-center`}
                >
                  <FiTrendingUp
                    className={`text-4xl mb-4 ${
                      darkMode ? "text-richblack-400" : "text-richblack-300"
                    }`}
                  />
                  <p
                    className={`text-lg font-medium ${
                      darkMode ? "text-richblack-50" : "text-richblack-600"
                    }`}
                  >
                    Pas assez de données pour visualiser
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      darkMode ? "text-richblack-400" : "text-richblack-500"
                    }`}
                  >
                    Les statistiques apparaîtront lorsque vous aurez plus
                    d'apprenants
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Courses Section */}
          <motion.div
            variants={fadeIn}
            className={`mt-6 rounded-xl ${
              darkMode ? "bg-richblack-800" : "bg-white shadow-md"
            } p-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-lg font-bold ${
                  darkMode ? "text-richblack-5" : "text-richblack-800"
                }`}
              >
                Vos formations récentes
              </h2>
              <Link
                to="/dashboard/my-courses"
                className={`text-sm font-semibold ${
                  darkMode ? "text-blue-100" : "text-blue-600"
                } hover:underline flex items-center gap-1`}
              >
                Tout afficher <FiArrowRight size={14} />
              </Link>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course, index) => (
                  <motion.div
                    key={course._id}
                    variants={fadeIn}
                    transition={{ delay: index * 0.1 }}
                    className={`group rounded-xl overflow-hidden ${
                      darkMode ? "bg-richblack-700" : "bg-richblack-5"
                    } hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                      {/* Course stats overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              darkMode ? "text-white" : "text-white"
                            } bg-black/30 px-2 py-1 rounded-full`}
                          >
                            <FiUsers size={12} />
                            <span>
                              {course.studentsEnrolled?.length || 0} apprenants
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3
                        className={`font-medium text-base mb-2 line-clamp-1 ${
                          darkMode ? "text-richblack-5" : "text-richblack-800"
                        } group-hover:text-blue-100 transition-colors`}
                      >
                        {course.courseName}
                      </h3>

                      <p
                        className={`text-xs line-clamp-2 mb-3 ${
                          darkMode ? "text-richblack-300" : "text-richblack-600"
                        }`}
                      >
                        {course.courseDescription ||
                          "Aucune description disponible"}
                      </p>

                      <Link
                        to={`/dashboard/edit-course/${course._id}`}
                        className={`text-xs font-medium ${
                          darkMode ? "text-blue-100" : "text-blue-600"
                        } hover:underline flex items-center gap-1`}
                      >
                        Modifier la formation <FiArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p
                className={`text-center py-8 ${
                  darkMode ? "text-richblack-300" : "text-richblack-600"
                }`}
              >
                Aucune formation disponible
              </p>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          variants={fadeIn}
          className={`mt-10 rounded-xl ${
            darkMode ? "bg-richblack-800" : "bg-white shadow-md"
          } p-8 text-center`}
        >
          <div className="max-w-md mx-auto">
            <div
              className={`w-16 h-16 mx-auto rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-blue-50"
              } flex items-center justify-center mb-6`}
            >
              <FiBook
                className={`text-2xl ${
                  darkMode ? "text-blue-100" : "text-blue-600"
                }`}
              />
            </div>

            <h2
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Vous n'avez pas encore créé de formations
            </h2>

            <p
              className={`mb-8 ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Commencez à partager vos connaissances en créant votre premiere
              formation
            </p>

            <Link
              to="/dashboard/add-course"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
                darkMode
                  ? "bg-blue-100 text-richblack-900 hover:bg-blue-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors font-medium`}
            >
              <FiPlus /> Créer une formation
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
