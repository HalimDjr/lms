import React from "react";
import { useSelector } from "react-redux";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCertificate,
  FaStar,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";

const LearningGridArray = [
  {
    order: -1,
    heading: "Formation d'excellence pour",
    highlightText: "tous, partout",
    description:
      "EPB Learning s'associe à plus de 50 entreprises portuaires et maritimes pour offrir une formation flexible, abordable et pertinente aux professionnels du secteur portuaire dans le monde entier.",
    BtnText: "En savoir plus",
    BtnLink: "/",
    icon: <FaUsers />,
  },
  {
    order: 1,
    heading: "Programme basé sur les besoins du secteur",
    description:
      "Gagnez du temps et de l'argent ! Notre programme est conçu pour être facile à comprendre et aligné sur les besoins spécifiques du secteur portuaire.",
    icon: <FaBriefcase />,
  },
  {
    order: 2,
    heading: "Nos méthodes d'apprentissage",
    description:
      "Nous combinons théorie et pratique avec des simulations interactives et des études de cas réels pour une formation complète et efficace.",
    icon: <FaChalkboardTeacher />,
  },
  {
    order: 3,
    heading: "Certification reconnue",
    description:
      "Obtenez des certifications reconnues par les autorités portuaires internationales pour valoriser votre parcours professionnel.",
    icon: <FaCertificate />,
  },
  {
    order: 4,
    heading: "Évaluation automatisée",
    description:
      "Notre système d'évaluation automatique vous permet de suivre votre progression et d'identifier vos points d'amélioration en temps réel.",
    icon: <FaStar />,
  },
  {
    order: 5,
    heading: "Prêt à l'emploi",
    description:
      "Nos formations sont conçues pour vous préparer directement aux défis quotidiens de votre environnement de travail portuaire.",
    icon: <FaGraduationCap />,
  },
];

const LearningGrid = () => {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div className="grid mx-auto w-[350px] lg:w-fit grid-cols-1 lg:grid-cols-4 mb-12 gap-3">
      {LearningGridArray.map((card, i) => {
        return (
          <div
            key={i}
            className={`${
              i === 0 && "lg:col-span-2 lg:h-[294px]"
            } rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${
              card.order < 0
                ? `${
                    darkMode
                      ? "bg-gradient-to-br from-blue-900 to-indigo-900"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600"
                  } text-white`
                : card.order % 2 === 1
                ? `${darkMode ? "bg-richblack-700" : "bg-blue-50"} h-[294px]`
                : card.order % 2 === 0
                ? `${darkMode ? "bg-richblack-800" : "bg-white"} h-[294px]`
                : "bg-transparent"
            } ${card.order === 3 && "lg:col-start-2"} shadow-lg`}
          >
            {card.order < 0 ? (
              <div className="lg:w-[90%] flex flex-col gap-3 p-8">
                <div className="text-4xl font-semibold">
                  {card.heading} <HighlightText text={card.highlightText} />
                </div>
                <p
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-100"
                  } font-medium`}
                >
                  {card.description}
                </p>

                <div className="w-fit mt-4">
                  <CTAButton active={true} linkto={card.BtnLink}>
                    {card.BtnText}
                  </CTAButton>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${
                      darkMode
                        ? "bg-blue-900 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {card.icon}
                  </div>
                  <h1
                    className={`${
                      darkMode ? "text-richblack-5" : "text-gray-800"
                    } text-lg font-bold`}
                  >
                    {card.heading}
                  </h1>
                </div>

                <p
                  className={`${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  } font-medium`}
                >
                  {card.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningGrid;
