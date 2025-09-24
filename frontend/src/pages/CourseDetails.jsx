import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { BiBook, BiInfoCircle, BiUser } from "react-icons/bi";
import {
  FaChalkboardTeacher,
  FaRegClock,
  FaTags,
  FaBookmark,
  FaRegBookmark,
  FaShare,
} from "react-icons/fa";
import { GiReturnArrow } from "react-icons/gi";
import {
  MdOutlineVerified,
  MdOutlinePlayLesson,
  MdOutlineWbSunny,
} from "react-icons/md";
import { HiOutlineMoon } from "react-icons/hi";

// Components
import ConfirmationModal from "../components/common/ConfirmationModal";
import Footer from "../components/common/Footer";
import RatingStars from "../components/common/RatingStars";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import Img from "./../components/common/Img";

// Services & Utils
import { formatDate } from "../services/formatDate";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import { enrollFreeCourse } from "../services/operations/studentFeaturesAPI";
import GetAvgRating from "../utils/avgRating";
import toast from "react-hot-toast";

function CourseDetails() {
  // Redux state
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);
  const { darkMode } = useSelector((state) => state.theme) || {
    darkMode: true,
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Local state
  const [response, setResponse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  const [isActive, setIsActive] = useState([]);
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetailsData = async () => {
      try {
        const res = await fetchCourseDetails(courseId);
        setResponse(res);
      } catch (error) {
        toast.error("Impossible de charger les détails du cours");
      }
    };
    fetchCourseDetailsData();
    window.scrollTo(0, 0);
  }, [courseId]);

  // Calculate average rating
  useEffect(() => {
    if (response?.data?.courseDetails?.ratingAndReviews) {
      const count = GetAvgRating(response.data.courseDetails.ratingAndReviews);
      setAvgReviewCount(count);
    }
  }, [response]);

  // Calculate total lectures
  useEffect(() => {
    if (response?.data?.courseDetails?.courseContent) {
      let lectures = 0;
      response.data.courseDetails.courseContent.forEach((sec) => {
        lectures += sec.subSection.length || 0;
      });
      setTotalNoOfLectures(lectures);
    }
  }, [response]);

  // Handle accordion toggle
  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    );
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: response?.data?.courseDetails?.courseName,
        text:
          response?.data?.courseDetails?.courseDescription.substring(0, 100) +
          "...",
        url: window.location.href,
      });
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
    setShowShareOptions(false);
  };

  // Toggle theme
  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  // Handle enrollment
  const handleEnrollCourse = () => {
    if (!token) {
      setConfirmationModal({
        text1: "Vous n'êtes pas connecté !",
        text2: "Veuillez vous connecter pour vous inscrire au cours.",
        btn1Text: "Se connecter",
        btn2Text: "Annuler",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }

    const coursesId = [courseId];
    enrollFreeCourse(token, coursesId, user, navigate, dispatch);
  };

  // Loading state
  if (paymentLoading || loading || !response) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-richblack-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div
          className="animate-spin h-12 w-12 border-4 rounded-full border-t-transparent border-b-transparent"
          style={{
            borderColor: darkMode
              ? "#60A5FA #1E293B #1E293B"
              : "#3B82F6 #E5E7EB #E5E7EB",
          }}
        ></div>
      </div>
    );
  }

  // Extract course data
  const {
    courseName,
    courseDescription,
    thumbnail,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag,
  } = response.data.courseDetails;

  return (
    <div
      className={
        darkMode ? "bg-richblack-900 text-white" : "bg-gray-50 text-gray-900"
      }
    >
      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={toggleTheme}
        className={`fixed top-24 right-6 z-50 p-3 rounded-full shadow-lg ${
          darkMode
            ? "bg-yellow-50 text-richblack-900"
            : "bg-richblack-800 text-yellow-50"
        }`}
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <MdOutlineWbSunny size={20} />
        ) : (
          <HiOutlineMoon size={20} />
        )}
      </motion.button>

      {/* Hero Section */}
      <div
        className={`relative w-full ${
          darkMode ? "bg-richblack-800" : "bg-blue-50"
        } pt-8 pb-12`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6" onClick={() => navigate(-1)}>
            <button
              className={`flex items-center gap-2 ${
                darkMode ? "text-blue-100" : "text-blue-600"
              }`}
            >
              <GiReturnArrow className="w-5 h-5" />
              <span>Retour</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info - Left Column */}
            <div className="lg:col-span-2">
              {/* Mobile Thumbnail */}
              <div className="relative block lg:hidden mb-6">
                <Img
                  src={thumbnail}
                  alt={courseName}
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>

              {/* Course Title and Actions */}
              <div className="flex items-center gap-4 mb-4">
                <h1
                  className={`text-3xl md:text-4xl font-bold leading-tight flex-grow`}
                >
                  {courseName}
                </h1>

                <div className="flex gap-3">
                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded-full ${
                      darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                    }`}
                  >
                    {isBookmarked ? (
                      <FaBookmark
                        className={
                          darkMode ? "text-yellow-50" : "text-blue-600"
                        }
                        size={18}
                      />
                    ) : (
                      <FaRegBookmark
                        className={
                          darkMode ? "text-richblack-300" : "text-gray-500"
                        }
                        size={18}
                      />
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className={`p-2 rounded-full ${
                        darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                      }`}
                    >
                      <FaShare
                        className={
                          darkMode ? "text-richblack-300" : "text-gray-500"
                        }
                        size={18}
                      />
                    </button>

                    <AnimatePresence>
                      {showShareOptions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute right-0 mt-2 p-3 rounded-lg shadow-lg z-10 ${
                            darkMode ? "bg-richblack-700" : "bg-white"
                          } border ${
                            darkMode
                              ? "border-richblack-600"
                              : "border-gray-200"
                          }`}
                        >
                          <button
                            onClick={copyToClipboard}
                            className={`whitespace-nowrap text-sm ${
                              darkMode ? "text-richblack-100" : "text-gray-700"
                            }`}
                          >
                            Copier le lien
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Course Description - Shortened */}
              <p
                className={`${
                  darkMode ? "text-richblack-100" : "text-gray-700"
                } mb-6`}
              >
                {courseDescription.length > 200
                  ? `${courseDescription.substring(0, 200)}...`
                  : courseDescription}
              </p>

              {/* Ratings and Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                  } px-3 py-1 rounded-full`}
                >
                  <span
                    className={darkMode ? "text-yellow-50" : "text-blue-600"}
                    font-semibold
                  >
                    {avgReviewCount}
                  </span>
                  <RatingStars Review_Count={avgReviewCount} Star_Size={16} />
                  <span
                    className={
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }
                  >
                    ({ratingAndReviews.length})
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                  } px-3 py-1 rounded-full`}
                >
                  <BiUser
                    className={darkMode ? "text-blue-100" : "text-blue-600"}
                  />
                  <span>{studentsEnrolled.length} Apprenants</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                  } px-3 py-1 rounded-full`}
                >
                  <BiInfoCircle
                    className={darkMode ? "text-blue-100" : "text-blue-600"}
                  />
                  <span>Créé le {formatDate(createdAt)}</span>
                </div>
              </div>

              {/* Instructor Info - Compact */}
              <div
                className={`flex items-center gap-3 mb-6 p-3 rounded-lg ${
                  darkMode ? "bg-richblack-700" : "bg-white shadow-sm"
                }`}
              >
                <Img
                  src={instructor.image}
                  alt={`${instructor.firstName} ${instructor.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="flex items-center gap-1">
                    <span className="font-medium">
                      {instructor.firstName} {instructor.lastName}
                    </span>
                    <MdOutlineVerified className="text-blue-400" size={16} />
                  </p>
                  <p
                    className={
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }
                    text-sm
                  >
                    Formateur
                  </p>
                </div>
              </div>

              {/* Mobile Enroll Button */}
              <div className="lg:hidden mb-8">
                <button
                  onClick={
                    user && studentsEnrolled.includes(user?._id)
                      ? () => navigate("/dashboard/enrolled-courses")
                      : handleEnrollCourse
                  }
                  className={`w-full py-3 px-6 ${
                    darkMode
                      ? "bg-yellow-50 hover:bg-yellow-100 text-richblack-900"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } font-semibold rounded-lg shadow-lg`}
                >
                  {user && studentsEnrolled.includes(user?._id)
                    ? "Accéder au cours"
                    : "S'inscrire maintenant"}
                </button>
              </div>
            </div>

            {/* Course Card - Right Column (Desktop Only) */}
            <div className="hidden lg:block">
              <div
                className={`${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600"
                    : "bg-white border-gray-200"
                } rounded-xl overflow-hidden shadow-lg border`}
              >
                <div className="relative">
                  <Img
                    src={thumbnail}
                    alt={courseName}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-5">
                    <div className="space-y-2 mb-4">
                      <div
                        className={`flex items-center gap-2 ${
                          darkMode ? "text-richblack-100" : "text-gray-700"
                        }`}
                      >
                        <MdOutlinePlayLesson
                          className={
                            darkMode ? "text-blue-100" : "text-blue-600"
                          }
                        />
                        <span>{totalNoOfLectures} leçons</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          darkMode ? "text-richblack-100" : "text-gray-700"
                        }`}
                      >
                        <FaRegClock
                          className={
                            darkMode ? "text-blue-100" : "text-blue-600"
                          }
                        />
                        <span>{response.data?.totalDuration} de contenu</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={
                      user && studentsEnrolled.includes(user?._id)
                        ? () => navigate("/dashboard/enrolled-courses")
                        : handleEnrollCourse
                    }
                    className={`w-full py-3 px-6 ${
                      darkMode
                        ? "bg-yellow-50 hover:bg-yellow-100 text-richblack-900"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } font-semibold rounded-lg shadow-lg`}
                  >
                    {user && studentsEnrolled.includes(user?._id)
                      ? "Accéder au cours"
                      : "S'inscrire maintenant"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content - Simplified */}
      <div className={darkMode ? "bg-richblack-900" : "bg-gray-50"}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            {/* What You'll Learn Section - Compact */}
            <div className="mb-10">
              <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2`}>
                <BiBook
                  className={darkMode ? "text-yellow-50" : "text-blue-600"}
                />
                Ce que vous apprendrez
              </h2>

              <div
                className={`${
                  darkMode ? "bg-richblack-700" : "bg-white"
                } border ${
                  darkMode ? "border-richblack-600" : "border-gray-200"
                } rounded-xl p-5`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatYouWillLearn &&
                    whatYouWillLearn
                      .split("\n")
                      .slice(0, 4)
                      .map((line, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div
                            className={`${
                              darkMode
                                ? "bg-blue-100 text-richblack-800"
                                : "bg-blue-600 text-white"
                            } h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
                          >
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <p
                            className={
                              darkMode ? "text-richblack-100" : "text-gray-700"
                            }
                          >
                            {line}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            {/* Tags Section - Compact */}
            <div className="mb-10">
              <h2 className={`text-xl font-bold mb-3 flex items-center gap-2`}>
                <FaTags
                  className={darkMode ? "text-yellow-50" : "text-blue-600"}
                />
                Tags
              </h2>

              <div className="flex flex-wrap gap-2">
                {tag &&
                  tag.map((item, ind) => (
                    <span
                      key={ind}
                      className={`${
                        darkMode
                          ? "bg-richblack-700 text-richblack-100"
                          : "bg-blue-100 text-blue-800"
                      } px-3 py-1 rounded-full text-sm`}
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            {/* Course Content Section - Simplified */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold flex items-center gap-2`}>
                  <MdOutlinePlayLesson
                    className={darkMode ? "text-yellow-50" : "text-blue-600"}
                  />
                  Contenu du cours
                </h2>

                <button
                  className={`${
                    darkMode ? "text-blue-100" : "text-blue-600"
                  } text-sm`}
                  onClick={() => setIsActive([])}
                >
                  Tout réduire
                </button>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-richblack-700 border-richblack-600"
                    : "bg-white border-gray-200"
                } border rounded-xl overflow-hidden`}
              >
                <div
                  className={`${
                    darkMode ? "bg-richblack-800" : "bg-gray-100"
                  } p-3 flex items-center justify-between text-sm`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    <span>{courseContent.length} sections</span>
                    <span>•</span>
                    <span>{totalNoOfLectures} leçons</span>
                  </div>
                </div>

                <div
                  className={`divide-y ${
                    darkMode ? "divide-richblack-600" : "divide-gray-200"
                  }`}
                >
                  {courseContent?.slice(0, 3).map((course, index) => (
                    <CourseAccordionBar
                      course={course}
                      key={index}
                      isActive={isActive}
                      handleActive={handleActive}
                      darkMode={darkMode}
                    />
                  ))}

                  {courseContent?.length > 3 && (
                    <div
                      className={`p-3 text-center ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      + {courseContent.length - 3} autres sections
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div
              className={`${
                darkMode ? "bg-richblack-700" : "bg-blue-50"
              } rounded-xl p-6 text-center mb-10`}
            >
              <h2 className={`text-xl font-bold mb-3`}>
                Prêt à commencer votre apprentissage ?
              </h2>
              <p
                className={`${
                  darkMode ? "text-richblack-100" : "text-gray-700"
                } mb-4`}
              >
                Rejoignez {studentsEnrolled.length} étudiants déjà inscrits.
              </p>
              <button
                onClick={
                  user && studentsEnrolled.includes(user?._id)
                    ? () => navigate("/dashboard/enrolled-courses")
                    : handleEnrollCourse
                }
                className={`py-2 px-6 ${
                  darkMode
                    ? "bg-yellow-50 hover:bg-yellow-100 text-richblack-900"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } font-medium rounded-lg shadow-md`}
              >
                {user && studentsEnrolled.includes(user?._id)
                  ? "Continuer l'apprentissage"
                  : "S'inscrire maintenant"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer darkMode={darkMode} />

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal modalData={confirmationModal} darkMode={darkMode} />
      )}
    </div>
  );
}

export default CourseDetails;
