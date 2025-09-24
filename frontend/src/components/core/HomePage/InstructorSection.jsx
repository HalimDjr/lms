// frontend/src/components/core/HomePage/InstructorSection.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Instructor from "../../../assets/ins2.jpg";
import HighlightText from "./HighlightText";
import {
  FaArrowRight,
  FaChalkboardTeacher,
  FaUsers,
  FaLaptop,
} from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import Img from "./../../common/Img";
import InstructorApplicationForm from "./InstructorApplicationForm";

import { motion } from "framer-motion";

const InstructorSection = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.profile);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleButtonClick = () => {
    if (user) {
      // Si l'utilisateur est connecté, rediriger vers le dashboard
      window.location.href = "/dashboard";
    } else {
      // Sinon, afficher le formulaire de candidature
      setShowApplicationForm(true);
    }
  };

  const benefits = [
    {
      icon: <FaUsers />,
      title: "Public ciblé",
      description: "Enseignez exclusivement au personnel de l'EPB",
    },
    {
      icon: <FaLaptop />,
      title: "Outils pédagogiques",
      description:
        "Accédez à des outils adaptés pour former les équipes de l'EPB",
    },
    {
      icon: <MdOutlineVerified />,
      title: "Support dédié",
      description:
        "Bénéficiez d'un accompagnement personnalisé par notre équipe",
    },
  ];

  return (
    <section
      className={`py-24 px-4 relative overflow-hidden ${
        darkMode
          ? "bg-gradient-to-b from-richblack-900 to-richblack-800"
          : "bg-gradient-to-b from-[#fbf9e4] to-[#f8f4d5]"
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-20 right-10 w-72 h-72 rounded-full ${
            darkMode ? "bg-blue-500/5" : "bg-blue-500/10"
          } blur-3xl`}
        ></div>
        <div
          className={`absolute -bottom-20 -left-20 w-96 h-96 rounded-full ${
            darkMode ? "bg-yellow-500/5" : "bg-yellow-500/10"
          } blur-3xl`}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col-reverse lg:flex-row gap-16 lg:gap-24 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="lg:w-1/2 w-full"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl">
                <Img
                  src={Instructor}
                  alt="Formateur EPB"
                  className="w-full object-cover hover:scale-105 transition-all duration-700"
                />

                {/* Overlay with gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    darkMode ? "from-richblack-900" : "from-black/30"
                  } to-transparent opacity-40`}
                ></div>

                {/* Stats Badge */}
                <div
                  className={`absolute bottom-6 left-6 px-4 py-3 rounded-xl ${
                    darkMode
                      ? "bg-richblack-900/80 border border-richblack-700"
                      : "bg-white/90 border border-gray-100"
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        darkMode ? "bg-yellow-500/20" : "bg-yellow-100"
                      }`}
                    >
                      <FaChalkboardTeacher
                        className={
                          darkMode ? "text-yellow-500" : "text-yellow-600"
                        }
                        size={20}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-richblack-300" : "text-richblack-600"
                        }`}
                      >
                        Rejoignez notre plateforme
                      </p>
                      <p
                        className={`font-bold ${
                          darkMode ? "text-white" : "text-richblack-900"
                        }`}
                      >
                        Formateurs pour l'EPB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-yellow-50 opacity-80 -z-10"></div>
              <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-blue-100 opacity-60 -z-10"></div>

              {/* Pattern Overlay */}
              <div className="absolute inset-0 -z-10 opacity-5">
                <div className="absolute inset-0 bg-grid-pattern"></div>
              </div>
            </div>
          </motion.div>

          {/* Content Column */}
          <div className="lg:w-1/2 w-full flex flex-col">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-richblack-700 text-yellow-500"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Opportunité d'enseignement
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`text-3xl lg:text-5xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-richblack-800"
              }`}
            >
              Devenez un
              <HighlightText text={" Formateur"} />
              <span
                className={`block text-lg mt-2 font-normal ${
                  darkMode ? "text-yellow-500" : "text-blue-600"
                }`}
              >
                Partagez votre expertise avec le personnel de l'EPB
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={`font-medium text-lg ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              } mb-8 leading-relaxed`}
            >
              Rejoignez notre équipe de formateurs et partagez votre expertise
              avec le personnel de l'EPB. Nous vous offrons une plateforme
              dédiée et des outils pédagogiques adaptés pour dispenser des
              formations de qualité et contribuer au développement des
              compétences au sein de l'organisation.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`p-4 rounded-xl ${
                    darkMode
                      ? "bg-richblack-800 border border-richblack-700"
                      : "bg-white border border-gray-100 shadow-sm"
                  }`}
                >
                  <div
                    className={`p-3 rounded-full w-fit mb-3 ${
                      darkMode
                        ? "bg-richblack-700 text-yellow-500"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    className={`font-bold mb-1 ${
                      darkMode ? "text-white" : "text-richblack-800"
                    }`}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-richblack-600"
                    }`}
                  >
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="w-fit"
            >
              <button
                onClick={handleButtonClick}
                className={`flex items-center gap-3 font-medium px-8 py-4 rounded-xl text-lg transition-all duration-300 ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } shadow-lg hover:shadow-xl`}
              >
                Devenir formateur
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaArrowRight />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplicationForm && (
        <InstructorApplicationForm
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      {/* Add this CSS to your global styles or use inline styles */}
      <style jsx="true">{`
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle,
            currentColor 1px,
            transparent 1px
          );
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
};

export default InstructorSection;
