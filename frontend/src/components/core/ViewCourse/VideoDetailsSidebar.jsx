import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import IconBtn from "./../../common/IconBtn";
import { setCourseViewSidebar } from "../../../slices/sidebarSlice";

import { BsChevronDown, BsCheckCircleFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";

export default function VideoDetailsSidebar({ setReviewModal }) {
  const [activeStatus, setActiveStatus] = useState("");
  const [videoBarActive, setVideoBarActive] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { sectionId, subSectionId } = useParams();
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  const { courseViewSidebar } = useSelector((state) => state.sidebar);
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    (() => {
      if (!courseSectionData.length) return;
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      );
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId);
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id;
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id);
      setVideoBarActive(activeSubSectionId);
    })();
  }, [courseSectionData, courseEntireData, location.pathname]);

  const getCompletionPercentage = () => {
    if (!totalNoOfLectures) return 0;
    return Math.round((completedLectures?.length / totalNoOfLectures) * 100);
  };

  return (
    <div
      className={`flex h-[calc(100vh)] w-[320px] max-w-[350px] flex-col ${
        darkMode
          ? "bg-richblack-900 border-r border-richblack-700"
          : "bg-[#0a2f59]/10 border-r border-[#0a2f59]/20"
      } shadow-lg`}
    >
      {/* Header */}
      <div
        className={`px-5 py-4 flex flex-col gap-4 ${
          darkMode
            ? "bg-richblack-800 border-b border-richblack-700"
            : "bg-[#0a2f59]/20 border-b border-[#0a2f59]/30"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Mobile menu toggle */}
          <div
            className="sm:hidden cursor-pointer"
            onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}
          >
            {courseViewSidebar ? (
              <IoMdClose
                size={24}
                className={`${
                  darkMode ? "text-richblack-200" : "text-[#0a2f59]"
                } hover:opacity-75 transition-opacity`}
              />
            ) : (
              <HiMenuAlt1
                size={24}
                className={`${
                  darkMode ? "text-richblack-200" : "text-[#0a2f59]"
                } hover:opacity-75 transition-opacity`}
              />
            )}
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(`/dashboard/enrolled-courses`)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              darkMode
                ? "bg-richblack-800 text-richblack-100 hover:bg-richblack-700"
                : "bg-white text-[#0a2f59] hover:bg-[#0a2f59]/10"
            }`}
            title="Retour aux formations"
          >
            <IoIosArrowBack size={16} />
            <span>Retour</span>
          </button>

          {/* Review button */}
          <IconBtn
            text="Avis"
            onClick={() => setReviewModal(true)}
            customClasses="text-sm"
          />
        </div>

        {/* Course title and progress */}
        <div>
          <h3
            className={`font-bold text-lg mb-2 line-clamp-2 ${
              darkMode ? "text-richblack-5" : "text-[#0a2f59]"
            }`}
          >
            {courseEntireData?.courseName}
          </h3>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span
                className={`${
                  darkMode ? "text-richblack-300" : "text-[#0a2f59]/80"
                }`}
              >
                Progression
              </span>
              <span
                className={`font-medium ${
                  darkMode ? "text-yellow-50" : "text-[#0a2f59]"
                }`}
              >
                {getCompletionPercentage()}%
              </span>
            </div>
            <div
              className={`h-1.5 w-full rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-[#0a2f59]/20"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  darkMode ? "bg-yellow-50" : "bg-[#0a2f59]"
                }`}
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <p
              className={`text-xs mt-1 ${
                darkMode ? "text-richblack-400" : "text-[#0a2f59]/80"
              }`}
            >
              {completedLectures?.length} sur {totalNoOfLectures} leçons
              complétées
            </p>
          </div>
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto">
        {courseSectionData.map((section, index) => (
          <div
            key={index}
            className={`mb-2 mx-2 mt-2 rounded-lg overflow-hidden ${
              darkMode ? "bg-richblack-800" : "bg-white"
            } ${
              activeStatus === section?._id
                ? darkMode
                  ? "ring-1 ring-yellow-50"
                  : "ring-1 ring-[#0a2f59]/40 shadow-md"
                : ""
            }`}
          >
            {/* Section header */}
            <button
              onClick={() =>
                setActiveStatus(
                  section?._id === activeStatus ? "" : section?._id
                )
              }
              className={`w-full flex items-center justify-between p-3 ${
                darkMode ? "hover:bg-richblack-700" : "hover:bg-[#0a2f59]/10"
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    darkMode
                      ? "bg-richblack-700 text-yellow-50"
                      : "bg-[#0a2f59]/20 text-[#0a2f59]"
                  }`}
                >
                  {index + 1}
                </div>
                <h4
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-50" : "text-[#0a2f59]"
                  }`}
                >
                  {section?.sectionName}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${
                    darkMode ? "text-richblack-300" : "text-[#0a2f59]/80"
                  }`}
                >
                  {section?.subSection.length} leçon
                  {section?.subSection.length > 1 ? "s" : ""}
                </span>
                <span
                  className={`transform transition-transform duration-300 ${
                    activeStatus === section?._id ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <BsChevronDown
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-[#0a2f59]/80"
                    }`}
                  />
                </span>
              </div>
            </button>

            {/* Subsections */}
            {activeStatus === section?._id && (
              <div
                className={`${
                  darkMode ? "bg-richblack-900" : "bg-[#0a2f59]/5"
                } py-1`}
              >
                {section.subSection.map((topic, i) => {
                  const isCompleted = completedLectures.includes(topic?._id);
                  const isActive = videoBarActive === topic._id;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(
                          `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
                        );
                        setVideoBarActive(topic._id);
                        courseViewSidebar && window.innerWidth <= 640
                          ? dispatch(setCourseViewSidebar(false))
                          : null;
                      }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                        isActive
                          ? darkMode
                            ? "bg-richblack-700"
                            : "bg-[#0a2f59]/15"
                          : ""
                      } ${
                        darkMode
                          ? "hover:bg-richblack-700"
                          : "hover:bg-[#0a2f59]/15"
                      } mx-2 my-1 rounded-md`}
                    >
                      <div
                        className={`flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full ${
                          isCompleted
                            ? darkMode
                              ? "bg-yellow-50"
                              : "bg-green-100"
                            : isActive
                            ? darkMode
                              ? "bg-richblack-600"
                              : "bg-[#0a2f59]/20"
                            : darkMode
                            ? "bg-richblack-700"
                            : "bg-white border border-[#0a2f59]/20"
                        }`}
                      >
                        {isCompleted ? (
                          <BsCheckCircleFill
                            className={`text-xs ${
                              darkMode ? "text-richblack-900" : "text-green-600"
                            }`}
                          />
                        ) : (
                          <FaPlay
                            className={`text-[8px] ${
                              isActive
                                ? darkMode
                                  ? "text-yellow-50"
                                  : "text-[#0a2f59]"
                                : darkMode
                                ? "text-richblack-300"
                                : "text-[#0a2f59]/80"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive
                              ? darkMode
                                ? "text-yellow-50"
                                : "text-[#0a2f59]"
                              : darkMode
                              ? "text-richblack-50"
                              : "text-[#0a2f59]/90"
                          }`}
                        >
                          {topic.title}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            darkMode
                              ? "text-richblack-400"
                              : "text-[#0a2f59]/70"
                          }`}
                        >
                          {isCompleted ? "Terminé" : "Non terminé"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
