import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaRegFilePdf, FaRegFilePowerpoint } from "react-icons/fa";
import { BiDownload, BiExpand } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { getSubSectionResources } from "../../../services/operations/courseDetailsAPI";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const CourseResources = ({ subSectionId }) => {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [viewerError, setViewerError] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (!subSectionId || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getSubSectionResources(subSectionId, token);
        if (data) {
          setResources(data.resources || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des ressources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [subSectionId, token]);

  const openResource = (resource) => {
    setSelectedResource(resource);
    setViewerError(false);
  };

  const closeViewer = () => {
    setSelectedResource(null);
  };

  // Générer l'URL pour afficher la ressource avec le token
  const getResourceViewUrl = (resourceId) => {
    return `${BASE_URL}/course/resources/${resourceId}`;
  };

  // Fonction pour télécharger directement la ressource
  const downloadResource = async (resource) => {
    try {
      // Utiliser axios pour inclure le token dans l'en-tête
      const response = await axios.get(
        `${BASE_URL}/course/download-resource/${resource._id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Déterminer l'extension de fichier en fonction du type
      const fileExtension = resource.fileType === "pdf" ? "pdf" : "pptx";

      // Créer un blob et un lien de téléchargement
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${resource.title || "document"}.${fileExtension}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      // Afficher un message d'erreur à l'utilisateur
      alert("Erreur lors du téléchargement du document");
    }
  };

  // Gérer l'erreur de chargement du document
  const handleViewerError = () => {
    setViewerError(true);
  };

  // Fonction pour obtenir l'icône en fonction du type de fichier
  const getFileIcon = (fileType) => {
    if (fileType === "pdf") {
      return (
        <FaRegFilePdf
          className={`text-lg ${darkMode ? "text-yellow-50" : "text-red-500"}`}
        />
      );
    } else if (fileType === "ppt") {
      return (
        <FaRegFilePowerpoint
          className={`text-lg ${
            darkMode ? "text-orange-50" : "text-orange-500"
          }`}
        />
      );
    }
    return (
      <FaRegFilePdf
        className={`text-lg ${darkMode ? "text-yellow-50" : "text-red-500"}`}
      />
    );
  };

  if (loading) {
    return (
      <div
        className={`mt-4 p-6 rounded-lg flex justify-center ${
          darkMode ? "bg-richblack-800" : "bg-gray-100"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
            darkMode ? "border-yellow-50" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div
        className={`mt-4 p-6 rounded-lg text-center ${
          darkMode
            ? "bg-richblack-800 text-richblack-300"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        Aucune ressource disponible pour cette leçon.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div
        className={`p-6 rounded-lg ${
          darkMode ? "bg-richblack-800" : "bg-gray-100"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Ressources disponibles
        </h3>

        <div className="space-y-2">
          {resources.map((resource, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-md p-3 transition-all ${
                darkMode
                  ? "bg-richblack-700 hover:bg-richblack-600"
                  : "bg-white hover:bg-gray-50 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                {getFileIcon(resource.fileType)}
                <span
                  className={`text-sm ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {resource.title}
                  <span
                    className={`ml-2 text-xs uppercase ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    {resource.fileType}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Bouton pour télécharger la ressource */}
                <button
                  onClick={() => downloadResource(resource)}
                  className={`flex items-center gap-1 text-sm ${
                    darkMode
                      ? "text-yellow-50 hover:text-yellow-100"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  <BiDownload />
                  <span>Télécharger</span>
                </button>

                {/* Bouton pour ouvrir la ressource dans la visionneuse */}
                <button
                  onClick={() => openResource(resource)}
                  className={`flex items-center gap-1 text-sm ${
                    darkMode
                      ? "text-blue-300 hover:text-blue-200"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  <BiExpand />
                  <span>Ouvrir</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resource Viewer Modal */}
        {selectedResource && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-70">
            <div
              className={`relative w-11/12 h-5/6 max-w-4xl rounded-lg overflow-hidden ${
                darkMode ? "bg-richblack-900" : "bg-white"
              }`}
            >
              <div
                className={`flex justify-between items-center p-4 ${
                  darkMode ? "bg-richblack-800" : "bg-gray-100"
                }`}
              >
                <h3
                  className={`font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-800"
                  }`}
                >
                  {selectedResource.title}
                  <span
                    className={`ml-2 text-xs uppercase ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    {selectedResource.fileType}
                  </span>
                </h3>
                <button
                  onClick={closeViewer}
                  className={`${
                    darkMode
                      ? "text-richblack-300 hover:text-richblack-100"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div
                className={`h-[calc(100%-4rem)] w-full ${
                  darkMode ? "bg-richblack-700" : "bg-gray-50"
                }`}
              >
                {viewerError || selectedResource.fileType === "ppt" ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p
                      className={`mb-4 ${
                        darkMode ? "text-richblack-300" : "text-gray-600"
                      }`}
                    >
                      {selectedResource.fileType === "ppt"
                        ? "Les fichiers PowerPoint ne peuvent pas être affichés directement dans l'application."
                        : "Le document ne peut pas être affiché directement dans l'application."}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => downloadResource(selectedResource)}
                        className={`px-4 py-2 rounded-md ${
                          darkMode
                            ? "bg-yellow-50 text-richblack-900"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Télécharger le document
                      </button>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // Ouvrir dans un nouvel onglet avec le token
                          const fetchAndOpen = async () => {
                            try {
                              const response = await axios.get(
                                getResourceViewUrl(selectedResource._id),
                                {
                                  responseType: "blob",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              // Déterminer le type MIME en fonction du type de fichier
                              const mimeType =
                                selectedResource.fileType === "pdf"
                                  ? "application/pdf"
                                  : "application/vnd.openxmlformats-officedocument.presentationml.presentation";

                              const blob = new Blob([response.data], {
                                type: mimeType,
                              });
                              const url = URL.createObjectURL(blob);
                              window.open(url, "_blank");
                            } catch (error) {
                              console.error("Erreur:", error);
                              alert("Impossible d'ouvrir le document");
                            }
                          };
                          fetchAndOpen();
                        }}
                        className={`px-4 py-2 rounded-md ${
                          darkMode
                            ? "bg-richblack-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        Ouvrir dans un nouvel onglet
                      </a>
                    </div>
                  </div>
                ) : (
                  // Utiliser un composant personnalisé pour afficher le PDF avec le token
                  <DocumentViewer
                    resourceId={selectedResource._id}
                    fileType={selectedResource.fileType}
                    token={token}
                    onError={handleViewerError}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher le document avec le token
const DocumentViewer = ({ resourceId, fileType, token, onError, darkMode }) => {
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/course/resources/${resourceId}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Déterminer le type MIME en fonction du type de fichier
        const mimeType =
          fileType === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.presentationml.presentation";

        const blob = new Blob([response.data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDocumentUrl(url);
      } catch (error) {
        console.error("Erreur lors du chargement du document:", error);
        onError();
      }
    };

    loadDocument();

    // Nettoyer l'URL lors du démontage
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [resourceId, fileType, token, onError]);

  if (!documentUrl) {
    return (
      <div className="flex justify-center items-center h-full">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
            darkMode ? "border-yellow-50" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  // Pour l'instant, seuls les PDF peuvent être affichés dans un iframe
  // Les PowerPoint seront gérés par la condition dans le composant parent
  return (
    <iframe
      src={documentUrl}
      className="w-full h-full"
      title="Document Viewer"
      onError={onError}
    />
  );
};

export default CourseResources;
