import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useSelector } from "react-redux";

const Img = ({ src, className = "", alt, placeholderSrc, onClick }) => {
  const { darkMode } = useSelector((state) => state.theme);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Gestion des erreurs de chargement d'image
  const handleError = () => {
    setIsError(true);
  };

  // Gestion du chargement réussi
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Placeholder par défaut en fonction du mode sombre/clair
  const defaultPlaceholder = darkMode
    ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23475569'%3EChargement...%3C/text%3E%3C/svg%3E"
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%2394a3b8'%3EChargement...%3C/text%3E%3C/svg%3E";

  // Image de remplacement en cas d'erreur
  const errorImage = darkMode
    ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23ef4444'%3EImage non disponible%3C/text%3E%3C/svg%3E"
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23ef4444'%3EImage non disponible%3C/text%3E%3C/svg%3E";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LazyLoadImage
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        alt={alt || "Image"}
        effect="blur"
        src={isError ? errorImage : src}
        placeholderSrc={placeholderSrc || defaultPlaceholder}
        onError={handleError}
        afterLoad={handleLoad}
        onClick={onClick}
        wrapperClassName="w-full h-full"
      />

      {/* Overlay de chargement */}
      {!isLoaded && !isError && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            darkMode ? "bg-richblack-800" : "bg-gray-100"
          }`}
        >
          <div
            className={`animate-pulse w-8 h-8 rounded-full ${
              darkMode ? "bg-blue-600" : "bg-blue-400"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Img;
