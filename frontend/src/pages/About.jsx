import React from "react";
import { useSelector } from "react-redux";
import Footer from "../components/common/Footer";
import LearningGrid from "../components/core/AboutPage/LearningGrid";
import Quote from "../components/core/AboutPage/Quote";
import StatsComponenet from "../components/core/AboutPage/Stats";
import HighlightText from "../components/core/HomePage/HighlightText";
import Img from "../components/common/Img";
import ReviewSlider from "../components/common/ReviewSlider";

import { motion } from "framer-motion";
import { fadeIn } from "../components/common/motionFrameVarients";
import { FaAnchor, FaShip, FaUsers, FaGraduationCap } from "react-icons/fa";

const About = () => {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Section Héro */}
      <section
        className={`relative overflow-hidden pt-10 pb-40 ${
          darkMode
            ? "bg-gradient-to-b from-blue-900 to-richblack-900"
            : "bg-gradient-to-b from-blue-600 to-blue-800"
        }`}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center">
          <motion.header className="mx-auto py-20 text-4xl font-semibold lg:w-[80%]">
            <motion.p
              variants={fadeIn("down", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="text-white"
            >
              Formation d'Excellence pour le Personnel Portuaire chez
              <HighlightText text={" EPB Learning"} />
            </motion.p>

            <motion.p
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="mx-auto mt-6 text-center text-base font-medium text-gray-300 lg:w-[85%]"
            >
              EPB Learning est à l'avant-garde de l'innovation en matière de
              formation portuaire en ligne. Nous nous engageons à développer les
              compétences de notre personnel pour un avenir plus efficace et
              sécurisé dans nos opérations portuaires.
            </motion.p>
          </motion.header>

          <div className="sm:h-[70px] lg:h-[150px]"></div>

          <div className="absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-1 md:grid-cols-3 gap-3 lg:gap-5">
            <motion.div
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="overflow-hidden rounded-lg shadow-xl"
            >
              <Img
                src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3"
                alt="Formation portuaire"
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              variants={fadeIn("up", 0.3)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="overflow-hidden rounded-lg shadow-xl hidden md:block"
            >
              <Img
                src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3"
                alt="Opérations portuaires"
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              variants={fadeIn("up", 0.3)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="overflow-hidden rounded-lg shadow-xl hidden md:block"
            >
              <Img
                src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3"
                alt="Opérations portuaires"
                className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Citation */}
      <section
        className={`border-b ${
          darkMode ? "border-richblack-700" : "border-gray-200"
        }`}
      >
        <div
          className={`mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 ${
            darkMode ? "text-richblack-300" : "text-gray-600"
          }`}
        >
          <div className="h-[100px]"></div>
          <Quote />
        </div>
      </section>
      {/* Section Histoire de Fondation */}
      <section className="py-24 relative overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div
          className={`absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none ${
            darkMode ? "opacity-3" : "opacity-10"
          }`}
        >
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-cyan-400 blur-[120px]"></div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-16">
          {/* Titre de section avec soulignement décoratif */}
          <div className="text-center mb-8">
            <h2
              className={`text-3xl md:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Notre{" "}
              <span className="bg-gradient-to-r from-[#0077B6] to-[#48CAE4] bg-clip-text text-transparent">
                Histoire
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#0077B6] to-[#48CAE4] mx-auto rounded-full"></div>
          </div>

          {/* Premier bloc: Histoire */}
          <div className="flex flex-col items-center gap-12 lg:flex-row justify-between">
            <motion.div
              variants={fadeIn("right", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="my-10 flex lg:w-[50%] flex-col gap-10"
            >
              <h3
                className={`bg-gradient-to-br from-[#0077B6] via-[#0096C7] to-[#48CAE4] bg-clip-text text-4xl font-semibold text-transparent lg:w-[90%] relative`}
              >
                Notre Parcours
                <span className="absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r from-[#0077B6] to-[#48CAE4] rounded-full"></span>
              </h3>
              <p
                className={`text-lg font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } lg:w-[95%] leading-relaxed`}
              >
                EPB Learning est né de la vision de l'Entreprise Portuaire pour
                transformer la formation de son personnel. Face aux défis
                croissants du secteur maritime et portuaire, nous avons reconnu
                la nécessité de développer une plateforme de formation en ligne
                accessible, flexible et de haute qualité.
              </p>
              <p
                className={`text-lg font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } lg:w-[95%] leading-relaxed`}
              >
                En tant qu'experts du domaine portuaire, nous avons constaté les
                limites des méthodes de formation traditionnelles. Nous avons
                créé cette plateforme pour permettre à notre personnel d'accéder
                à des formations spécialisées, quel que soit leur emplacement ou
                leur horaire de travail.
              </p>

              {/* Bouton "En savoir plus" */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-fit px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } transition-all duration-300 shadow-lg hover:shadow-blue-500/30`}
              >
                En savoir plus
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeIn("left", 0.1)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className="relative lg:w-[45%]"
            >
              {/* Effet de halo lumineux */}
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl"></div>

              {/* Cadre décoratif */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#0077B6] to-[#48CAE4] rounded-lg opacity-70 blur-sm"></div>

              {/* Image avec effet de survol */}
              <Img
                src="https://images.unsplash.com/photo-1589216532372-1c2a367900d9?ixlib=rb-4.0.3"
                alt="Histoire d'EPB Learning"
                className="relative rounded-lg shadow-[0_0_20px_0] shadow-[#0077B6] hover:shadow-[#48CAE4] transition-all duration-500 transform hover:scale-[1.02] w-full h-full object-cover aspect-video"
              />

              {/* Badge flottant */}
              <div
                className={`absolute -bottom-5 -right-5 px-4 py-2 rounded-full ${
                  darkMode
                    ? "bg-richblack-900 text-blue-400"
                    : "bg-white text-blue-600"
                } font-bold shadow-lg flex items-center gap-2`}
              >
                <span className="text-sm">Depuis 2020</span>
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    darkMode ? "bg-blue-400" : "bg-blue-600"
                  }`}
                ></div>
              </div>
            </motion.div>
          </div>

          {/* Séparateur décoratif */}
          <div className="flex items-center justify-center my-8">
            <div
              className={`w-full h-px ${
                darkMode ? "bg-richblack-700" : "bg-gray-200"
              }`}
            ></div>
            <div className="px-4">
              <div
                className={`p-2 rounded-full ${
                  darkMode ? "bg-richblack-800" : "bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`w-full h-px ${
                darkMode ? "bg-richblack-700" : "bg-gray-200"
              }`}
            ></div>
          </div>

          {/* Deuxième bloc: Vision et Mission */}
          <div className="flex flex-col items-stretch lg:gap-10 lg:flex-row justify-between">
            {/* Carte Vision */}
            <motion.div
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className={`my-6 flex lg:w-[48%] flex-col gap-8 p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                darkMode
                  ? "bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-6">
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                >
                  <FaShip
                    className={`text-3xl ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <span
                    className={`text-sm uppercase tracking-wider font-medium ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Notre approche
                  </span>
                  <h3 className="bg-gradient-to-b from-[#0077B6] to-[#48CAE4] bg-clip-text text-3xl font-bold text-transparent">
                    Vision
                  </h3>
                </div>
              </div>

              <p
                className={`text-lg font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } leading-relaxed`}
              >
                Avec cette vision, nous avons entrepris de créer une plateforme
                d'apprentissage en ligne qui révolutionne la formation du
                personnel portuaire. Notre équipe d'experts dédiés a travaillé
                sans relâche pour développer un système robuste et intuitif qui
                combine technologie de pointe et contenu engageant.
              </p>

              {/* Points clés */}
              <ul className="space-y-3 mt-2">
                {[
                  "Innovation pédagogique",
                  "Excellence technique",
                  "Accessibilité maximale",
                ].map((point, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        darkMode ? "bg-blue-900/50" : "bg-blue-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Carte Mission */}
            <motion.div
              variants={fadeIn("up", 0.3)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: false, amount: 0.1 }}
              className={`my-6 flex lg:w-[48%] flex-col gap-8 p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                darkMode
                  ? "bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-6">
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                >
                  <FaAnchor
                    className={`text-3xl ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <span
                    className={`text-sm uppercase tracking-wider font-medium ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Notre engagement
                  </span>
                  <h3 className="bg-gradient-to-b from-[#0096C7] to-[#90E0EF] text-transparent bg-clip-text text-3xl font-bold">
                    Mission
                  </h3>
                </div>
              </div>

              <p
                className={`text-lg font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } leading-relaxed`}
              >
                Notre mission va au-delà de la simple offre de cours en ligne.
                Nous visons à créer une communauté d'apprentissage dynamique où
                les professionnels portuaires peuvent se connecter, collaborer
                et apprendre les uns des autres.
              </p>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                {[
                  { value: "50+", label: "Formations" },
                  { value: "1000+", label: "Apprenants" },
                  { value: "95%", label: "Satisfaction" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Valeurs */}
      <section
        className={`py-16 ${darkMode ? "bg-richblack-800" : "bg-blue-50"}`}
      >
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nos Valeurs Fondamentales
            </h2>
            <p
              className={`max-w-2xl mx-auto ${
                darkMode ? "text-richblack-300" : "text-gray-600"
              }`}
            >
              Les principes qui guident notre approche de la formation portuaire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaUsers />,
                title: "Collaboration",
                description:
                  "Nous croyons en la force du travail d'équipe et de l'apprentissage collaboratif.",
              },
              {
                icon: <FaGraduationCap />,
                title: "Excellence",
                description:
                  "Nous visons l'excellence dans tous nos programmes de formation.",
              },
              {
                icon: <FaShip />,
                title: "Innovation",
                description:
                  "Nous adoptons les technologies émergentes pour améliorer l'apprentissage.",
              },
              {
                icon: <FaAnchor />,
                title: "Sécurité",
                description:
                  "La sécurité est au cœur de toutes nos formations portuaires.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn("up", 0.1 * (index + 1))}
                initial="hidden"
                whileInView={"show"}
                viewport={{ once: false, amount: 0.1 }}
                className={`p-6 rounded-xl ${
                  darkMode
                    ? "bg-richblack-900 hover:bg-richblack-700"
                    : "bg-white hover:bg-blue-50"
                } transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div
                  className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ${
                    darkMode
                      ? "bg-blue-900 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <span className="text-2xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <StatsComponenet />

      {/* Section Grille d'Apprentissage */}
      <section
        className={`mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nos Programmes de Formation
          </h2>
          <p
            className={`max-w-2xl mx-auto ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Découvrez notre gamme complète de formations spécialisées conçues
            pour répondre aux besoins spécifiques des professionnels du secteur
            portuaire.
          </p>
        </div>
        <LearningGrid />
      </section>

      {/* Section Avis */}
      <div
        className={`my-20 px-5 py-16 ${
          darkMode ? "bg-richblack-800 text-white" : "bg-blue-50 text-gray-800"
        }`}
      >
        <h1 className="text-center text-4xl font-semibold mb-12">
          Témoignages de nos Apprenants
        </h1>
        <div className="max-w-6xl mx-auto">
          <ReviewSlider />
        </div>
      </div>

      {/* Section Appel à l'Action */}
      <section
        className={`py-16 ${
          darkMode
            ? "bg-gradient-to-b from-richblack-900 to-blue-900"
            : "bg-gradient-to-b from-white to-blue-600"
        }`}
      >
        <div className="w-11/12 max-w-maxContent mx-auto text-center">
          <motion.div
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="mb-8"
          >
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                !darkMode && "text-white"
              }`}
            >
              Prêt à Améliorer vos Compétences Portuaires?
            </h2>
            <p
              className={`max-w-2xl mx-auto mb-8 ${
                darkMode ? "text-richblack-300" : "text-white"
              }`}
            >
              Rejoignez EPB Learning aujourd'hui et accédez à des formations de
              qualité conçues spécifiquement pour les professionnels du secteur
              portuaire.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:shadow-lg ${
                darkMode ? "shadow-blue-900/30" : "shadow-blue-500/30"
              }`}
            >
              Commencer Maintenant
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

export default About;
