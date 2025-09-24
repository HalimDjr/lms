import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";

import "video-react/dist/video-react.css";
import { Player } from "video-react";

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
  darkMode = true, // Ajout du prop darkMode avec true comme valeur par défaut
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      previewFile(file);
      setSelectedFile(file);
    }
    setIsDragging(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png"] }
      : { "video/*": [".mp4"] },
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  useEffect(() => {
    register(name, { required: true });
  }, [register]);

  useEffect(() => {
    setValue(name, selectedFile);
  }, [selectedFile, setValue]);

  return (
    <div className="flex flex-col space-y-3">
      <label
        className={`text-sm font-medium ${
          darkMode ? "text-blue-500" : "text-richblack-800"
        } flex items-center`}
        htmlFor={name}
      >
        {label}{" "}
        {!viewData && <sup className="text-pink-200 ml-1 text-lg">*</sup>}
      </label>

      <div
        className={`
          ${
            isDragging || isDragActive
              ? darkMode
                ? "bg-richblack-600 border-yellow-50"
                : "bg-gray-200 border-blue-500"
              : darkMode
              ? "bg-richblack-700 border-richblack-500"
              : "bg-white border-gray-300"
          } 
          flex min-h-[250px] cursor-pointer items-center justify-center rounded-lg 
          border-2 border-dashed transition-all duration-300 
          ${
            darkMode
              ? "hover:border-yellow-50 hover:bg-richblack-600/50"
              : "hover:border-blue-500 hover:bg-gray-100"
          }
          ${darkMode ? "shadow-dark" : "shadow-sm"}
        `}
      >
        {previewSource ? (
          <div className="relative flex w-full flex-col p-4">
            <div
              className={`overflow-hidden rounded-lg ${
                darkMode ? "shadow-md" : "shadow"
              }`}
            >
              {!video ? (
                <img
                  src={previewSource}
                  alt="Preview"
                  className="h-full w-full rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <Player aspectRatio="16:9" playsInline src={previewSource} />
                </div>
              )}
            </div>

            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("");
                  setSelectedFile(null);
                  setValue(name, null);
                }}
                className={`mt-4 flex items-center justify-center gap-2 ${
                  darkMode
                    ? "text-richblack-300 hover:text-pink-200"
                    : "text-gray-600 hover:text-red-500"
                } transition-colors duration-300 self-center`}
              >
                <FiX className="text-lg" />
                <span className="underline">
                  Supprimer {video ? "la vidéo" : "l'image"}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div
            className="flex w-full flex-col items-center p-6"
            {...getRootProps()}
          >
            <input {...getInputProps()} ref={inputRef} />
            <div
              className={`grid aspect-square w-16 place-items-center rounded-full ${
                darkMode ? "bg-pure-greys-800" : "bg-gray-100"
              } shadow-lg transition-transform duration-300 hover:scale-110`}
            >
              <FiUploadCloud
                className={`text-3xl ${
                  darkMode ? "text-yellow-50" : "text-blue-500"
                }`}
              />
            </div>
            <p
              className={`mt-4 max-w-[250px] text-center text-sm ${
                darkMode ? "text-richblack-200" : "text-gray-600"
              }`}
            >
              Glissez et déposez {!video ? "une image" : "une vidéo"}, ou
              cliquez pour{" "}
              <span
                className={`font-semibold ${
                  darkMode ? "text-yellow-50" : "text-blue-600"
                } hover:underline`}
              >
                parcourir
              </span>{" "}
              vos fichiers
            </p>
            <div className="mt-8 w-full max-w-[80%]">
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-center text-xs">
                <div className="flex flex-col items-center">
                  <span
                    className={`${
                      darkMode ? "text-yellow-50" : "text-blue-600"
                    } font-medium mb-1`}
                  >
                    Format
                  </span>
                  <span
                    className={
                      darkMode ? "text-richblack-200" : "text-gray-600"
                    }
                  >
                    {!video ? "JPEG, JPG, PNG" : "MP4"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`${
                      darkMode ? "text-yellow-50" : "text-blue-600"
                    } font-medium mb-1`}
                  >
                    Ratio
                  </span>
                  <span
                    className={
                      darkMode ? "text-richblack-200" : "text-gray-600"
                    }
                  >
                    16:9
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`${
                      darkMode ? "text-yellow-50" : "text-blue-600"
                    } font-medium mb-1`}
                  >
                    Taille recommandée
                  </span>
                  <span
                    className={
                      darkMode ? "text-richblack-200" : "text-gray-600"
                    }
                  >
                    1024x576
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {errors[name] && (
        <span className="text-xs tracking-wide text-pink-200 flex items-center gap-1">
          <FiX className="text-sm" />
          {label} est requis
        </span>
      )}
    </div>
  );
}
