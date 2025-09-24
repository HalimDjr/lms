import { useState } from "react";
import { FiUploadCloud, FiX, FiTrash2 } from "react-icons/fi";
import {
  FaRegFilePdf,
  FaDownload,
  FaEye,
  FaRegFilePowerpoint,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export default function ResourceUpload({
  resources,
  setResources,
  viewOnly = false,
  subSectionId,
  setRemovedResources,
}) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Get token from Redux store
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Vérifier si tous les fichiers sont des PDFs ou PowerPoint
    const invalidFiles = files.filter(
      (file) =>
        file.type !== "application/pdf" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.presentationml.presentation" &&
        file.type !== "application/vnd.ms-powerpoint"
    );

    if (invalidFiles.length > 0) {
      toast.error("Seuls les fichiers PDF et PowerPoint sont autorisés");
      return;
    }

    // Créer les aperçus des ressources
    const newResources = files.map((file) => ({
      file,
      title: file.name.split(".")[0],
      fileType: file.type.includes("pdf") ? "pdf" : "ppt",
      isNew: true,
      localUrl: URL.createObjectURL(file), // Ajouter l'URL locale pour la prévisualisation
    }));

    setResources([...resources, ...newResources]);
    toast.success(`${files.length} ressource(s) ajoutée(s)`);
  };

  const removeLocalResource = (index) => {
    const newResources = [...resources];
    // Révoquer l'URL de l'objet si c'est une ressource locale
    if (newResources[index].localUrl) {
      URL.revokeObjectURL(newResources[index].localUrl);
    }
    newResources.splice(index, 1);
    setResources(newResources);
  };

  const deleteServerResource = async (resourceId) => {
    if (!subSectionId || !resourceId) {
      toast.error(
        "Impossible de supprimer la ressource : informations manquantes"
      );
      return;
    }

    try {
      setDeletingId(resourceId);
      setLoading(true);

      const response = await axios.delete(
        `${BASE_URL}/course/deleteResourceFromSubSection`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            subSectionId,
            resourceId,
          },
        }
      );

      if (response.data.success) {
        const newResources = resources.filter(
          (resource) => resource._id !== resourceId
        );
        setResources(newResources);

        // Si setRemovedResources est fourni, ajouter l'ID à la liste des ressources supprimées
        if (setRemovedResources) {
          setRemovedResources((prev) => [...prev, resourceId]);
        }

        toast.success("Ressource supprimée avec succès");
      } else {
        toast.error(response.data.message || "Échec de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const handleRemoveResource = (index, resource) => {
    if (resource.isNew) {
      removeLocalResource(index);
    } else if (resource._id) {
      deleteServerResource(resource._id);
    } else {
      removeLocalResource(index);
    }
  };

  const updateResourceTitle = (index, newTitle) => {
    const newResources = [...resources];
    newResources[index].title = newTitle;
    setResources(newResources);
  };

  // Fonction pour obtenir l'icône en fonction du type de fichier
  const getFileIcon = (fileType) => {
    if (fileType === "pdf") {
      return (
        <FaRegFilePdf
          className={`text-lg ${
            darkMode ? "text-yellow-50" : "text-yellow-600"
          }`}
        />
      );
    } else if (fileType === "ppt") {
      return (
        <FaRegFilePowerpoint
          className={`text-lg ${
            darkMode ? "text-orange-50" : "text-orange-600"
          }`}
        />
      );
    }
    return (
      <FaRegFilePdf
        className={`text-lg ${darkMode ? "text-yellow-50" : "text-yellow-600"}`}
      />
    );
  };

  const handlePreview = async (resource) => {
    if (resource.isNew && resource.localUrl) {
      window.open(resource.localUrl, "_blank");
    } else if (resource.fileUrl || resource._id) {
      try {
        toast.loading("Chargement du document...");
        // Récupérer le fichier avec l'en-tête Authorization
        const response = await axios.get(
          `${BASE_URL}/course/resources/${resource._id}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.dismiss();
        // Créer une URL d'objet et ouvrir dans un nouvel onglet
        const blob = new Blob([response.data], {
          type:
            resource.fileType === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        // Nettoyer l'URL de l'objet après un certain délai
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (error) {
        toast.dismiss();
        console.error("Erreur lors de l'ouverture du document:", error);
        toast.error("Impossible d'ouvrir le document");
      }
    }
  };

  const handleDownload = async (resource) => {
    try {
      toast.loading("Préparation du téléchargement...");

      if (resource.isNew && resource.file) {
        // Pour les nouveaux fichiers
        const url = URL.createObjectURL(resource.file);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resource.title}.${
          resource.fileType === "pdf" ? "pdf" : "pptx"
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Téléchargement démarré");
      } else if (resource._id) {
        // Pour les fichiers existants
        const response = await axios.get(
          `${BASE_URL}/course/download-resource/${resource._id}`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resource.title}.${
          resource.fileType === "pdf" ? "pdf" : "pptx"
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Téléchargement démarré");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label
          className={`text-sm font-medium ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
        >
          Ressources (PDF, PowerPoint){" "}
          {!viewOnly && (
            <span
              className={`text-xs ${
                darkMode ? "text-richblack-300" : "text-richblack-500"
              }`}
            >
              (Optionnel)
            </span>
          )}
        </label>

        {resources.length > 0 && (
          <span
            className={`text-xs ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            {resources.length} ressource(s)
          </span>
        )}
      </div>

      {/* Liste des ressources */}
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between rounded-lg p-3 ${
              darkMode
                ? "bg-richblack-700 border border-richblack-600 hover:bg-richblack-600"
                : "bg-white border border-richblack-100 hover:bg-richblack-50"
            } transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`p-2 rounded-full ${
                  darkMode ? "bg-yellow-900/30" : "bg-yellow-50"
                }`}
              >
                {getFileIcon(resource.fileType)}
              </div>
              {viewOnly ? (
                <span
                  className={`text-sm font-medium truncate ${
                    darkMode ? "text-richblack-5" : "text-richblack-700"
                  }`}
                >
                  {resource.title}
                </span>
              ) : (
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) => updateResourceTitle(index, e.target.value)}
                  className={`bg-transparent text-sm outline-none flex-1 min-w-0 ${
                    darkMode ? "text-richblack-5" : "text-richblack-700"
                  } focus:border-b ${
                    darkMode ? "focus:border-blue-500" : "focus:border-blue-600"
                  }`}
                  placeholder="Titre de la ressource"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Boutons d'action */}
              <button
                type="button"
                onClick={() => handlePreview(resource)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  darkMode
                    ? "bg-blue-900/20 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                }`}
                title="Aperçu"
              >
                <FaEye />
              </button>

              <button
                type="button"
                onClick={() => handleDownload(resource)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  darkMode
                    ? "bg-green-900/20 text-green-300 hover:bg-green-900/30 hover:text-green-200"
                    : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                }`}
                title="Télécharger"
              >
                <FaDownload />
              </button>

              {!viewOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveResource(index, resource)}
                  disabled={loading && resource._id === deletingId}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    darkMode
                      ? "bg-red-900/20 text-red-300 hover:bg-red-900/30 hover:text-red-200"
                      : "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Supprimer"
                >
                  {loading && resource._id === deletingId ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : resource.isNew ? (
                    <FiX />
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton d'upload */}
      {!viewOnly && (
        <div className="mt-4">
          <label
            className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 transition-all duration-300 ${
              darkMode
                ? "border-richblack-500 bg-richblack-700 text-richblack-200 hover:bg-richblack-600 hover:border-blue-500"
                : "border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:border-blue-400"
            } shadow-sm hover:shadow-md`}
          >
            <input
              type="file"
              accept="application/pdf, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.ms-powerpoint"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <div
              className={`p-2 rounded-full ${
                darkMode ? "bg-richblack-600" : "bg-white"
              }`}
            >
              <FiUploadCloud
                className={`text-xl ${
                  darkMode ? "text-blue-400" : "text-blue-500"
                }`}
              />
            </div>
            <span className="text-sm font-medium">
              Télécharger des ressources (PDF, PowerPoint)
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
