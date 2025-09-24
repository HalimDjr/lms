import React, { useState } from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  BsFillCaretRightFill,
  BsStarFill,
  BsStarHalf,
  BsStar,
} from "react-icons/bs";
import {
  FaShareSquare,
  FaUserGraduate,
  FaRegClock,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

import { ACCOUNT_TYPE } from "../../../utils/constants";
import Img from "./../../common/Img";

function CourseDetailsCard({
  course,
  setConfirmationModal,
  handleEnrollCourse,
}) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showFullDescription, setShowFullDescription] = useState(false);

  // Check if course exists and has a 'thumbnail', otherwise provide default
  const {
    thumbnail: ThumbnailImage = "default-image-url.jpg", // Use a default image if not present
    _id: courseId,
  } = course || {}; // Default to an empty object if `course` is undefined

  const handleShare = () => {
    copy(window.location.href);
    toast.success("Lien copié dans le presse-papiers");
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!course?.ratingAndReviews?.length) return 0;

    const totalRating = course.ratingAndReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );

    return totalRating / course.ratingAndReviews.length;
  };

  const averageRating = calculateAverageRating();

  // Generate star rating display
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<BsStarFill key={i} className="text-yellow-100" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-yellow-100" />);
      } else {
        stars.push(<BsStar key={i} className="text-yellow-100" />);
      }
    }

    return stars;
  };

  // Truncate description
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Check if user is enrolled
  const isEnrolled = user && course?.studentsEnrolled?.includes(user?._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col gap-4 rounded-2xl ${
        darkMode ? "bg-richblack-700" : "bg-white shadow-md"
      } overflow-hidden`}
    >
      {/* Course Image with Overlay */}
      <div className="relative">
        <Img
          src={ThumbnailImage}
          alt={course?.courseName || "Course Image"}
          className="h-[250px] w-full object-cover"
        />

        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Course info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Rating */}
          {course?.ratingAndReviews?.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStarRating(averageRating)}
              </div>
              <span className="text-white text-sm">
                ({course.ratingAndReviews.length} avis)
              </span>
            </div>
          )}

          {/* Course name */}
          <h1 className="text-2xl font-bold text-white mb-1">
            {course?.courseName}
          </h1>

          {/* Instructor name */}
          <div className="flex items-center gap-2">
            <FaChalkboardTeacher className="text-blue-100" />
            <p className="text-white text-sm">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="px-6 pb-6">
        {/* Course Stats */}
        <div
          className={`flex flex-wrap gap-4 py-4 border-b ${
            darkMode ? "border-richblack-600" : "border-richblack-100"
          }`}
        >
          {/* Students enrolled */}
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full ${
                darkMode ? "bg-richblack-800" : "bg-richblack-50"
              }`}
            >
              <FaUserGraduate
                className={`${darkMode ? "text-blue-100" : "text-blue-600"}`}
              />
            </div>
            <div>
              <p
                className={`text-xs ${
                  darkMode ? "text-richblack-300" : "text-richblack-500"
                }`}
              >
                Apprenants
              </p>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-richblack-5" : "text-richblack-800"
                }`}
              >
                {course?.studentsEnrolled?.length || 0}
              </p>
            </div>
          </div>

          {/* Course duration */}
          {course?.duration && (
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  darkMode ? "bg-richblack-800" : "bg-richblack-50"
                }`}
              >
                <FaRegClock
                  className={`${
                    darkMode ? "text-yellow-100" : "text-yellow-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    darkMode ? "text-richblack-300" : "text-richblack-500"
                  }`}
                >
                  Durée
                </p>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {course.duration}
                </p>
              </div>
            </div>
          )}

          {/* Course sections/lectures */}
          {course?.courseContent && (
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  darkMode ? "bg-richblack-800" : "bg-richblack-50"
                }`}
              >
                <HiOutlineDocumentText
                  className={`${
                    darkMode ? "text-green-300" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    darkMode ? "text-richblack-300" : "text-richblack-500"
                  }`}
                >
                  Sections
                </p>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {course.courseContent?.length || 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Course Description */}
        <div className="mt-4">
          <h3
            className={`text-lg font-semibold mb-2 ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            À propos du cours
          </h3>
          <p
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            {showFullDescription
              ? course?.courseDescription
              : truncateText(course?.courseDescription, 150)}

            {course?.courseDescription &&
              course.courseDescription.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className={`ml-1 font-medium ${
                    darkMode ? "text-blue-100" : "text-blue-600"
                  } hover:underline`}
                >
                  {showFullDescription ? "Voir moins" : "Voir plus"}
                </button>
              )}
          </p>
        </div>

        {/* Course Requirements */}
        {course?.instructions?.length > 0 && (
          <div className="mt-4">
            <h3
              className={`text-lg font-semibold mb-2 ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Prérequis
            </h3>
            <div
              className={`flex flex-col gap-2 text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              {course.instructions.map((item, i) => (
                <div className="flex items-start gap-2" key={i}>
                  <BsFillCaretRightFill className="mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {/* Enroll Button */}
          <button
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
              isEnrolled
                ? darkMode
                  ? "bg-richblack-800 text-richblack-5 hover:bg-richblack-900"
                  : "bg-richblack-50 text-richblack-800 hover:bg-richblack-100"
                : darkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={
              isEnrolled
                ? () => navigate("/dashboard/enrolled-courses")
                : handleEnrollCourse
            }
          >
            {isEnrolled ? "Accéder au cours" : "S'inscrire"}
          </button>

          {/* Share Button */}
          <button
            className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
              darkMode
                ? "bg-richblack-800 text-richblack-5 hover:bg-richblack-900"
                : "bg-richblack-50 text-richblack-800 hover:bg-richblack-100"
            } transition-all`}
            onClick={handleShare}
          >
            <FaShareSquare size={15} /> Partager
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default CourseDetailsCard;
