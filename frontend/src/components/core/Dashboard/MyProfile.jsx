import { useEffect } from "react";
import {
  RiEditBoxLine,
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
} from "react-icons/ri";
import { FaBriefcase, FaSchool, FaUserGraduate } from "react-icons/fa";
import { BsGenderAmbiguous } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { formattedDate } from "../../../utils/dateFormatter";
import IconBtn from "../../common/IconBtn";
import Img from "./../../common/Img";

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Helper function to determine if a field is empty
  const isFieldEmpty = (value) => {
    return value === undefined || value === null || value === "";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ staggerChildren: 0.1 }}
      className="w-full"
    >
      <motion.h1
        variants={fadeIn}
        className={`mb-8 text-3xl font-bold font-boogaloo text-center sm:text-left ${
          darkMode ? "text-richblack-5" : "text-richblack-800"
        }`}
      >
        Mon profil
      </motion.h1>

      {/* Profile Header */}
      <motion.div
        variants={fadeIn}
        className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-6 ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center gap-x-4">
          <div className="relative">
            {user?.image ? (
              <Img
                src={user.image}
                alt={`profile-${user?.firstName}`}
                className="h-20 w-20 rounded-full object-cover border-2 border-blue-100"
              />
            ) : (
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user?.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 ${
                darkMode
                  ? "border-richblack-800 bg-green-500"
                  : "border-white bg-green-500"
              }`}
            ></div>
          </div>
          <div className="space-y-1">
            <p
              className={`text-xl font-semibold capitalize ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {user?.firstName + " " + user?.lastName}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              {user?.email}
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-0">
          <IconBtn
            text="Modifier le profil"
            onClick={() => {
              navigate("/dashboard/settings");
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
      </motion.div>

      {/* Account Type Card */}
      <motion.div
        variants={fadeIn}
        className={`mt-6 p-6 rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-full ${
              darkMode ? "bg-richblack-700" : "bg-blue-50"
            }`}
          >
            <FaUserGraduate
              className={`text-xl ${
                darkMode ? "text-blue-100" : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Type de compte
            </p>
            <p
              className={`text-lg font-semibold capitalize ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {user?.accountType}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Personal Details */}
      <motion.div
        variants={fadeIn}
        className={`my-6 rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-dashed border-opacity-20 border-gray-400">
          <h2
            className={`text-lg font-semibold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Détails personnels
          </h2>
          <IconBtn
            text="Modifier"
            onClick={() => {
              navigate("/dashboard/settings");
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <RiUser3Line
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Prénom
                </p>
                <p
                  className={`text-base font-medium capitalize ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {user?.firstName || "Non renseigné"}
                </p>
              </div>
            </div>
            {/* Last Name */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <RiUser3Line
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Nom
                </p>
                <p
                  className={`text-base font-medium capitalize ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {user?.lastName || "Non renseigné"}
                </p>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <RiMailLine
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Email
                </p>
                <p
                  className={`text-base font-medium break-all ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {user?.email || "Non renseigné"}
                </p>
              </div>
            </div>
            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <RiPhoneLine
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Numéro de téléphone
                </p>
                <p
                  className={`text-base font-medium ${
                    isFieldEmpty(user?.additionalDetails?.contactNumber)
                      ? darkMode
                        ? "text-richblack-400 italic"
                        : "text-richblack-400 italic"
                      : darkMode
                      ? "text-richblack-5"
                      : "text-richblack-800"
                  }`}
                >
                  {user?.additionalDetails?.contactNumber || "Non renseigné"}
                </p>
              </div>
            </div>
            {/* Gender */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <BsGenderAmbiguous
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Sexe
                </p>
                <p
                  className={`text-base font-medium ${
                    isFieldEmpty(user?.additionalDetails?.gender)
                      ? darkMode
                        ? "text-richblack-400 italic"
                        : "text-richblack-400 italic"
                      : darkMode
                      ? "text-richblack-5"
                      : "text-richblack-800"
                  }`}
                >
                  {user?.additionalDetails?.gender || "Non renseigné"}
                </p>
              </div>
            </div>
            {/* Date of Birth */}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 mt-1 rounded-full ${
                  darkMode ? "bg-richblack-700" : "bg-richblack-50"
                }`}
              >
                <RiCalendarLine
                  className={
                    darkMode ? "text-richblack-100" : "text-richblack-600"
                  }
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-richblack-400" : "text-richblack-500"
                  }`}
                >
                  Date de naissance
                </p>
                <p
                  className={`text-base font-medium ${
                    isFieldEmpty(user?.additionalDetails?.dateOfBirth)
                      ? darkMode
                        ? "text-richblack-400 italic"
                        : "text-richblack-400 italic"
                      : darkMode
                      ? "text-richblack-5"
                      : "text-richblack-800"
                  }`}
                >
                  {formattedDate(user?.additionalDetails?.dateOfBirth) ||
                    "Non renseignée"}
                </p>
              </div>
            </div>
            {user?.accountType === "Student" &&
              user?.additionalDetails?.service && (
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 mt-1 rounded-full ${
                      darkMode ? "bg-richblack-700" : "bg-richblack-50"
                    }`}
                  >
                    <FaBriefcase
                      className={
                        darkMode ? "text-richblack-100" : "text-richblack-600"
                      }
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-richblack-400" : "text-richblack-500"
                      }`}
                    >
                      Service de travail
                    </p>
                    <p
                      className={`text-base font-medium ${
                        isFieldEmpty(user?.additionalDetails?.service)
                          ? darkMode
                            ? "text-richblack-400 italic"
                            : "text-richblack-400 italic"
                          : darkMode
                          ? "text-richblack-5"
                          : "text-richblack-800"
                      }`}
                    >
                      {user?.additionalDetails?.service || "Non renseigné"}
                    </p>
                  </div>
                </div>
              )}
            {user?.accountType === "Instructor" &&
              user?.additionalDetails?.ecole && (
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 mt-1 rounded-full ${
                      darkMode ? "bg-richblack-700" : "bg-richblack-50"
                    }`}
                  >
                    <FaSchool
                      className={
                        darkMode ? "text-richblack-100" : "text-richblack-600"
                      }
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-richblack-400" : "text-richblack-500"
                      }`}
                    >
                      École
                    </p>
                    <p
                      className={`text-base font-medium ${
                        isFieldEmpty(user?.additionalDetails?.ecole)
                          ? darkMode
                            ? "text-richblack-400 italic"
                            : "text-richblack-400 italic"
                          : darkMode
                          ? "text-richblack-5"
                          : "text-richblack-800"
                      }`}
                    >
                      {user?.additionalDetails?.ecole || "Non renseignée"}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </motion.div>

      {/* About Section (Commented out in original but improved here) */}
      {/*
      <motion.div 
        variants={fadeIn}
        className={`my-6 rounded-xl ${
          darkMode 
            ? "bg-richblack-800 border border-richblack-700" 
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-dashed border-opacity-20 border-gray-400">
          <h2 className={`text-lg font-semibold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}>
            À propos de moi
          </h2>
          <IconBtn
            text="Modifier"
            onclick={() => {
              navigate("/dashboard/settings");
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <div className="p-6">
          <p className={`${
            isFieldEmpty(user?.additionalDetails?.about)
              ? darkMode ? "text-richblack-400 italic" : "text-richblack-400 italic"
              : darkMode ? "text-richblack-5" : "text-richblack-800"
          } text-base leading-relaxed`}>
            {user?.additionalDetails?.about || "Parlez-nous un peu de vous..."}
          </p>
        </div>
      </motion.div>
      */}
    </motion.div>
  );
}
