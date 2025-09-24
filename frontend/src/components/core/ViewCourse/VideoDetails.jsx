// components/core/ViewCourse/VideoDetails.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, Tab } from "./tab";
import "video-react/dist/video-react.css";
import { BigPlayButton, Player } from "video-react";
import CourseResources from "./CourseResources";

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import { setCourseViewSidebar } from "../../../slices/sidebarSlice";
import {
  checkQuizAvailability,
  getSubSectionQuizResult,
} from "../../../services/operations/quizAPI";

import IconBtn from "../../common/IconBtn";
import { HiMenuAlt1 } from "react-icons/hi";
import CourseForum from "./CourseForum";
import SubSectionQuiz from "./SubSectionQuiz";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);
  const { darkMode } = useSelector((state) => state.theme);

  const [videoData, setVideoData] = useState([]);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("content");

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  useEffect(() => {
    (async () => {
      if (!courseSectionData.length) return;
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`);
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        );
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        );

        if (filteredVideoData && filteredVideoData.length > 0) {
          setVideoData(filteredVideoData[0]);
          setPreviewSource(courseEntireData.thumbnail);
          setVideoEnded(false);
          setShowQuiz(false);

          // Vérifier si la sous-section contient un quiz
          const hasQuizData = filteredVideoData[0]?.quiz?.isEnabled || false;
          setHasQuiz(hasQuizData);

          if (hasQuizData) {
            // Vérifier l'état de complétion du quiz à chaque changement de sous-section
            checkQuizCompletion();
          } else {
            setQuizCompleted(false);
          }
        }
      }
    })();
  }, [courseSectionData, courseEntireData, location.pathname, subSectionId]);

  // Vérifier si le quiz a déjà été complété
  const checkQuizCompletion = async () => {
    if (!subSectionId || !token) return;

    setQuizLoading(true);
    try {
      console.log("Vérification de la complétion du quiz pour:", subSectionId);

      // Vérifier d'abord si le quiz a été mis à jour
      const availabilityResponse = await checkQuizAvailability(
        subSectionId,
        token
      );
      console.log("Disponibilité du quiz:", availabilityResponse);

      // Si le quiz a été mis à jour et le résultat a été supprimé, considérer qu'il n'est pas complété
      if (
        availabilityResponse.quizUpdated &&
        availabilityResponse.resultDeleted
      ) {
        setQuizCompleted(false);
        console.log(
          "Quiz mis à jour, résultat supprimé, considéré comme non complété"
        );
        return;
      }

      // Sinon, vérifier normalement l'état de complétion
      const response = await getSubSectionQuizResult(subSectionId, token);
      console.log("Réponse de vérification du quiz:", response);

      if (response && response.success) {
        setQuizCompleted(response.completed);
        console.log("Quiz complété:", response.completed);
      } else {
        setQuizCompleted(false);
        console.log("Quiz non complété ou erreur");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du quiz:", error);
      setQuizCompleted(false);
    } finally {
      setQuizLoading(false);
    }
  };

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true;
    } else {
      return false;
    }
  };

  // go to the next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id;

      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id;
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id;
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  // go to the previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      );
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id;
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length;
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      );
    }
  };

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };

  const { courseViewSidebar } = useSelector((state) => state.sidebar);

  // this will hide course video , title , desc, if sidebar is open in small device
  if (courseViewSidebar && window.innerWidth <= 640) return;

  // Rendu des contrôles de fin de vidéo
  const renderVideoEndControls = () => {
    return (
      <div
        style={{
          backgroundImage:
            "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
        }}
        className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
      >
        {/* Afficher le bouton de quiz uniquement si la sous-section contient un quiz et qu'il n'a pas été complété */}
        {hasQuiz && !quizCompleted ? (
          <div className="flex flex-col items-center gap-4">
            <IconBtn
              disabled={loading || quizLoading}
              onClick={() => setShowQuiz(true)}
              text="Commencer le Quiz"
              customClasses={`text-xl max-w-max px-4 mx-auto ${
                darkMode
                  ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
              }`}
            />
            <p
              className={`text-sm ${
                darkMode ? "text-yellow-50" : "text-[#2364aa]"
              }`}
            >
              Complétez le quiz pour marquer cette leçon comme terminée
            </p>
          </div>
        ) : (
          <>
            {!completedLectures.includes(subSectionId) && (
              <IconBtn
                disabled={loading || (hasQuiz && !quizCompleted)}
                onClick={() => handleLectureCompletion()}
                text={loading ? "Chargement..." : "Marquer comme terminé"}
                customClasses={`text-xl max-w-max px-4 mx-auto ${
                  hasQuiz && !quizCompleted
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              />
            )}
            <IconBtn
              disabled={loading}
              onClick={() => {
                if (playerRef?.current) {
                  playerRef?.current?.seek(0);
                  setVideoEnded(false);
                }
              }}
              text="Revoir"
              customClasses="text-xl max-w-max px-4 mx-auto mt-2"
            />
          </>
        )}

        <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
          {!isFirstVideo() && (
            <button
              disabled={loading || (hasQuiz && !quizCompleted)}
              onClick={goToPrevVideo}
              className={`blackButton ${
                hasQuiz && !quizCompleted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Précédent
            </button>
          )}
          {!isLastVideo() && (
            <button
              disabled={loading || (hasQuiz && !quizCompleted)}
              onClick={goToNextVideo}
              className={`blackButton ${
                hasQuiz && !quizCompleted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col gap-5 ${
        darkMode ? "text-white" : "text-richblack-800"
      }`}
    >
      {/* open - close side bar icons */}
      <div
        className={`sm:hidden absolute left-7 top-3 cursor-pointer ${
          darkMode ? "text-white" : "text-richblack-800"
        }`}
        onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}
      >
        {!courseViewSidebar && <HiMenuAlt1 size={33} />}
      </div>

      {showQuiz ? (
        <SubSectionQuiz
          subSectionId={subSectionId}
          onQuizComplete={() => {
            setQuizCompleted(true);
            setShowQuiz(false);
            // Marquer automatiquement la leçon comme terminée après avoir complété le quiz
            if (!completedLectures.includes(subSectionId)) {
              handleLectureCompletion();
            }
          }}
          onClose={() => setShowQuiz(false)}
        />
      ) : (
        <>
          {!videoData ? (
            <img
              src={previewSource}
              alt="Preview"
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <Player
              ref={playerRef}
              aspectRatio="16:9"
              playsInline
              autoPlay
              onEnded={() => setVideoEnded(true)}
              src={videoData?.videoUrl}
            >
              <BigPlayButton position="center" />
              {/* Render When Video Ends */}
              {videoEnded && renderVideoEndControls()}
            </Player>
          )}
        </>
      )}

      <div className="mt-10 mb-12 w-full">
        <div
          className={`rounded-xl overflow-hidden ${
            darkMode
              ? "bg-richblack-900 border border-richblack-700 shadow-lg shadow-richblack-900/40"
              : "bg-white border border-gray-100 shadow-xl shadow-gray-200/60"
          }`}
        >
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className={`${
              darkMode
                ? "border-b border-richblack-700"
                : "border-b border-gray-100"
            }`}
          >
            <Tab
              label={
                <div
                  className={`flex items-center gap-2 py-3 px-4 font-medium transition-all duration-200 ${
                    activeTab === "content"
                      ? darkMode
                        ? "text-yellow-50"
                        : "text-blue-600"
                      : darkMode
                      ? "text-richblack-300 hover:text-richblack-100"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-colors ${
                      activeTab === "content"
                        ? darkMode
                          ? "text-yellow-50"
                          : "text-blue-600"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Contenu</span>
                </div>
              }
              value="content"
            >
              <div
                className={`p-6 rounded-b-lg ${
                  darkMode ? "bg-richblack-800" : "bg-white"
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-5 flex items-center gap-2 ${
                    darkMode ? "text-richblack-5" : "text-gray-800"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${
                      darkMode ? "text-yellow-50" : "text-blue-600"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  À propos de la leçon
                </h2>
                <div
                  className={`p-6 rounded-lg ${
                    darkMode
                      ? "bg-richblack-900 border border-richblack-700"
                      : "bg-gray-50 border border-gray-100 shadow-inner"
                  }`}
                >
                  <p
                    className={`leading-relaxed ${
                      darkMode ? "text-richblack-200" : "text-gray-700"
                    }`}
                  >
                    {videoData?.description ||
                      "Aucune description disponible pour cette leçon."}
                  </p>
                </div>

                {/* Indicateur de quiz */}
                {hasQuiz && (
                  <div
                    className={`mt-6 p-5 rounded-lg ${
                      darkMode
                        ? "bg-richblack-700 border border-yellow-50 border-opacity-20"
                        : "bg-blue-50 border border-blue-100 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 ${
                          darkMode ? "text-yellow-50" : "text-blue-600"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span
                        className={`font-semibold text-lg ${
                          darkMode ? "text-yellow-50" : "text-blue-700"
                        }`}
                      >
                        Quiz disponible
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-2 ${
                        darkMode ? "text-richblack-300" : "text-gray-600"
                      }`}
                    >
                      Cette leçon contient un quiz que vous devez compléter pour
                      continuer.
                    </p>
                    {quizCompleted ? (
                      <div className="mt-3 flex items-center gap-2 text-green-500 bg-green-50 p-3 rounded-md border border-green-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="font-medium">
                          Quiz complété avec succès
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowQuiz(true)}
                        className={`mt-3 px-5 py-2.5 rounded-md transition-all duration-200 font-medium ${
                          darkMode
                            ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100 hover:shadow-md"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md shadow-blue-200/50"
                        }`}
                      >
                        Commencer le quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              label={
                <div
                  className={`flex items-center gap-2 py-3 px-4 font-medium transition-all duration-200 ${
                    activeTab === "Forum"
                      ? darkMode
                        ? "text-yellow-50"
                        : "text-blue-600"
                      : darkMode
                      ? "text-richblack-300 hover:text-richblack-100"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-colors ${
                      activeTab === "Forum"
                        ? darkMode
                          ? "text-yellow-50"
                          : "text-blue-600"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span>Q/R</span>
                </div>
              }
              value="Forum"
            >
              <CourseForum subsectionId={subSectionId} />
            </Tab>

            <Tab
              label={
                <div
                  className={`flex items-center gap-2 py-3 px-4 font-medium transition-all duration-200 ${
                    activeTab === "Resources"
                      ? darkMode
                        ? "text-yellow-50"
                        : "text-blue-600"
                      : darkMode
                      ? "text-richblack-300 hover:text-richblack-100"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-colors ${
                      activeTab === "Resources"
                        ? darkMode
                          ? "text-yellow-50"
                          : "text-blue-600"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Ressources</span>
                </div>
              }
              value="Resources"
            >
              <CourseResources subSectionId={subSectionId} />
            </Tab>

            {/* Onglet Quiz (visible uniquement si la sous-section a un quiz) */}
            {hasQuiz && (
              <Tab
                label={
                  <div
                    className={`flex items-center gap-2 py-3 px-4 font-medium transition-all duration-200 ${
                      activeTab === "Quiz"
                        ? darkMode
                          ? "text-yellow-50"
                          : "text-blue-600"
                        : darkMode
                        ? "text-richblack-300 hover:text-richblack-100"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-colors ${
                        activeTab === "Quiz"
                          ? darkMode
                            ? "text-yellow-50"
                            : "text-blue-600"
                          : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span>Quiz</span>
                    {quizCompleted && (
                      <span className="ml-1 w-3 h-3 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></span>
                    )}
                  </div>
                }
                value="Quiz"
              >
                <div
                  className={`p-6 rounded-b-lg ${
                    darkMode ? "bg-richblack-800" : "bg-white"
                  }`}
                >
                  <SubSectionQuiz
                    subSectionId={subSectionId}
                    showResults={quizCompleted}
                    onQuizComplete={() => {
                      setQuizCompleted(true);
                      // Ne pas fermer automatiquement l'onglet des résultats
                    }}
                    onClose={() => setActiveTab("content")}
                  />
                </div>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
