import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RenderSteps from "./RenderSteps";
import {
  setEditCourse,
  resetCourseState,
} from "../../../../slices/courseSlice";

export default function AddCourse() {
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetCourseState());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <div className="flex w-full items-start gap-x-6">
      <div className="flex flex-1 flex-col">
        <div className="mb-14">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
            <div
              className={`p-2 rounded-lg ${
                darkMode ? "bg-blue-600/20" : "bg-blue-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <h1
                className={`text-3xl md:text-4xl font-bold text-center lg:text-left ${
                  darkMode ? "text-richblack-5" : "text-richblack-800"
                }`}
              >
                Ajouter une formation
              </h1>

              <p
                className={`mt-2 text-sm md:text-base ${
                  darkMode ? "text-richblack-300" : "text-gray-600"
                }`}
              >
                Partagez votre expertise en créant une formation structurée et
                engageante
              </p>
            </div>
          </div>

          <div
            className={`mt-6 h-1 w-20 rounded-full mx-auto lg:mx-0 ${
              darkMode ? "bg-blue-400" : "bg-blue-500"
            }`}
          ></div>
        </div>

        <div className="flex-1">
          <RenderSteps />
        </div>
      </div>

      {/* Formation Upload Tips */}
      <div
        className={`sticky top-10 hidden lg:block max-w-[400px] flex-1 rounded-xl border shadow-lg p-6 ${
          darkMode
            ? "border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900"
            : "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-full ${
              darkMode ? "bg-blue-600" : "bg-blue-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3
            className={`text-xl font-bold ${
              darkMode ? "text-richblack-5" : "text-blue-800"
            }`}
          >
            Conseils pour l'upload de la formation
          </h3>
        </div>

        <div
          className={`space-y-4 ${
            darkMode ? "text-richblack-100" : "text-blue-900"
          }`}
        >
          {[
            {
              title: "Taille de la miniature",
              description:
                "La taille standard pour la miniature de la formation est de 1024x576 pixels.",
              icon: "📐",
            },
            {
              title: "Section vidéo",
              description: "Contrôle la vidéo d'aperçu de la formation.",
              icon: "🎬",
            },
            {
              title: "Formation Builder",
              description:
                "C'est ici que vous créez et organisez une formation.",
              icon: "🏗️",
            },
            {
              title: "Ajout de sujets",
              description:
                "Ajoutez des sujets dans la section Formation Builder pour créer des leçons, des quiz et des devoirs.",
              icon: "📚",
            },
            {
              title: "Données supplémentaires",
              description:
                "Les informations de la section Données supplémentaires apparaissent sur la page unique de la formation.",
              icon: "📋",
            },
            {
              title: "Annonces",
              description:
                "Faites des annonces pour notifier des informations importantes à tous les apprenants inscrits en une seule fois.",
              icon: "📢",
            },
          ].map((item, index) => (
            <div key={index} className="flex gap-3 group">
              <div
                className={`mt-0.5 flex-shrink-0 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {item.icon}
              </div>
              <div>
                <h4
                  className={`font-medium text-sm ${
                    darkMode ? "text-richblack-5" : "text-blue-800"
                  } group-hover:underline`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-richblack-300" : "text-blue-700"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-6 pt-4 border-t ${
            darkMode ? "border-richblack-700" : "border-blue-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            <span className="font-medium">Besoin d'aide supplémentaire ?</span>
          </div>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-richblack-300" : "text-blue-700"
            }`}
          >
            Consultez notre{" "}
            <span className="underline cursor-pointer">guide complet</span> ou{" "}
            <span className="underline cursor-pointer">
              contactez le support
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
