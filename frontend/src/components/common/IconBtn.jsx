import React from "react";
import { useSelector } from "react-redux";

export default function IconBtn({
  text,
  onClick, // Corrigé ici
  children,
  disabled,
  outline = false,
  customClasses,
  type,
  variant = "primary", // primary, secondary, danger, success
  size = "medium", // small, medium, large
  fullWidth = false,
  loading = false,
}) {
  const { darkMode } = useSelector((state) => state.theme);

  // Définir les styles de base en fonction du variant
  const getVariantStyles = () => {
    const variants = {
      primary: {
        default: darkMode
          ? "bg-yellow-50 text-black hover:bg-yellow-100"
          : "bg-[#0a2f59] text-white hover:bg-blue-600", // Bleu en mode clair
        outline: darkMode
          ? "border-yellow-50 text-yellow-50 hover:bg-yellow-50/10"
          : "border-blue-500 text-blue-500 hover:bg-blue-500/10", // Bleu en mode clair
      },
      secondary: {
        default: darkMode
          ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
          : "bg-richblack-100 text-richblack-800 hover:bg-richblack-200",
        outline: darkMode
          ? "border-richblack-700 text-richblack-50 hover:bg-richblack-700/10"
          : "border-richblack-100 text-richblack-800 hover:bg-richblack-100/10",
      },
      danger: {
        default: darkMode
          ? "bg-pink-600 text-white hover:bg-pink-700"
          : "bg-red-500 text-white hover:bg-red-600",
        outline: darkMode
          ? "border-pink-600 text-pink-600 hover:bg-pink-600/10"
          : "border-red-500 text-red-500 hover:bg-red-500/10",
      },
      success: {
        default: darkMode
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-green-500 text-white hover:bg-green-600",
        outline: darkMode
          ? "border-green-600 text-green-600 hover:bg-green-600/10"
          : "border-green-500 text-green-500 hover:bg-green-500/10",
      },
    };

    return outline ? variants[variant].outline : variants[variant].default;
  };

  // Définir les styles de taille
  const getSizeStyles = () => {
    const sizes = {
      small: "py-1 px-3 text-sm",
      medium: "py-2 px-5 text-base",
      large: "py-3 px-6 text-lg",
    };
    return sizes[size];
  };

  // Définir les styles pour l'état désactivé
  const getDisabledStyles = () => {
    return darkMode
      ? "opacity-50 cursor-not-allowed bg-richblack-700 text-richblack-300"
      : "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500";
  };

  // Spinner pour l'état de chargement
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick} // Corrigé ici
      className={`
        flex items-center justify-center
        rounded-md font-semibold
        transition-all duration-200
        ${outline ? "border-2" : ""}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled ? getDisabledStyles() : ""}
        ${fullWidth ? "w-full" : ""}
        ${customClasses || ""}
        ${loading ? "cursor-wait" : ""}
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          darkMode
            ? "focus:ring-offset-richblack-800"
            : "focus:ring-offset-white"
        }
        focus:ring-opacity-50
        ${
          variant === "primary"
            ? darkMode
              ? "focus:ring-yellow-500"
              : "focus:ring-blue-500" // Bleu en mode clair
            : variant === "danger"
            ? "focus:ring-red-500"
            : variant === "success"
            ? "focus:ring-green-500"
            : "focus:ring-richblack-500"
        }
      `}
      type={type}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Chargement...</span>
        </>
      ) : children ? (
        <>
          {children}
          <span className="ml-2">{text}</span>
        </>
      ) : (
        text
      )}
    </button>
  );
}
