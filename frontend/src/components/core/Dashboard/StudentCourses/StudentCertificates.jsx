// frontend/src/components/core/Dashboard/StudentCourses/StudentCertificates.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
import {
  FaArrowLeft,
  FaFileDownload,
  FaCertificate,
  FaTimes,
} from "react-icons/fa";
import { getStudentCertificates } from "../../../../services/operations/certificateAPI";
import Loading from "../../../common/Loading";

export default function StudentCertificates() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentCertificateName, setCurrentCertificateName] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const response = await getStudentCertificates(token);
        if (response?.data) {
          setCertificates(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des certificats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token]);

  const handleViewCertificate = async (certificateId, courseName) => {
    try {
      const response = await fetch(
        `${BASE_URL}/course/certificate/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du certificat");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Au lieu d'ouvrir dans un nouvel onglet, on stocke l'URL et on affiche la modal
      setPdfUrl(url);
      setCurrentCertificateName(courseName);
      setShowPdfModal(true);
    } catch (error) {
      console.error("Erreur:", error);
      // Vous pouvez ajouter ici une notification d'erreur si vous le souhaitez
    }
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    // Libérer l'URL de l'objet blob pour éviter les fuites de mémoire
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1
          className={`text-3xl font-medium ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Mes Certificats
        </h1>
        <button
          onClick={() => navigate("/dashboard/enrolled-courses")}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-[#0a2f59] text-white"
          }`}
        >
          <FaArrowLeft />
          Retour aux cours
        </button>
      </div>

      {certificates.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center h-60 rounded-md ${
            darkMode ? "bg-richblack-800" : "bg-gray-100"
          }`}
        >
          <FaCertificate
            size={50}
            className={darkMode ? "text-richblack-300" : "text-gray-500"}
            style={{ marginBottom: "1rem" }}
          />
          <p
            className={`text-xl ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Vous n'avez pas encore obtenu de certificat
          </p>
          <p
            className={`mt-2 text-center ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Terminez avec succès les examens finaux des cours certifiants pour
            obtenir vos certificats
          </p>
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className={`mt-4 flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
              darkMode
                ? "bg-yellow-50 text-richblack-900"
                : "bg-blue-600 text-white"
            }`}
          >
            Explorer mes cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate._id}
              className={`rounded-lg overflow-hidden border transition-all duration-200 ${
                darkMode
                  ? "bg-richblack-800 border-richblack-700 hover:border-richblack-500"
                  : "bg-white border-gray-200 hover:border-gray-400 shadow-sm"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2
                    className={`text-xl font-semibold ${
                      darkMode ? "text-richblack-5" : "text-richblack-800"
                    }`}
                  >
                    {certificate.course.courseName}
                  </h2>
                  <FaCertificate
                    className={darkMode ? "text-yellow-50" : "text-yellow-500"}
                    size={24}
                  />
                </div>

                <p
                  className={`text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  Certificat délivré le {formatDate(certificate.issuedAt)}
                </p>

                <div
                  className={`flex justify-between items-center text-sm mb-4 ${
                    darkMode ? "text-richblack-300" : "text-gray-600"
                  }`}
                >
                  <div>
                    Par: {certificate.instructor.firstName}{" "}
                    {certificate.instructor.lastName}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() =>
                      handleViewCertificate(
                        certificate._id,
                        certificate.course.courseName
                      )
                    }
                    className={`flex items-center justify-center gap-2 w-full py-2 rounded-md transition-colors ${
                      darkMode
                        ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                        : "bg-[#0a2f59] text-white hover:bg-blue-700"
                    }`}
                  >
                    <FaFileDownload />
                    Voir mon certificat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal pour afficher le PDF */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`rounded-xl w-11/12 h-[90vh] max-w-5xl flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
              darkMode ? "bg-richblack-900" : "bg-white"
            }`}
          >
            <div
              className={`flex justify-between items-center p-5 border-b ${
                darkMode ? "border-richblack-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold flex items-center gap-2 ${
                  darkMode ? "text-yellow-50" : "text-richblack-800"
                }`}
              >
                <FaCertificate
                  className={darkMode ? "text-yellow-50" : "text-[#0a2f59]"}
                />
                <span>Certificat: {currentCertificateName}</span>
              </h3>
              <button
                onClick={closePdfModal}
                className={`rounded-full p-2 transition-colors duration-200 ${
                  darkMode
                    ? "text-richblack-300 hover:text-white hover:bg-richblack-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
                aria-label="Fermer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <div
                className="w-full h-full rounded-lg overflow-hidden shadow-inner border border-opacity-20 
          bg-gray-50 dark:bg-richblack-800"
              >
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Certificat PDF"
                  loading="lazy"
                />
              </div>
            </div>

            <div
              className={`p-5 border-t flex justify-between items-center ${
                darkMode ? "border-richblack-700" : "border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-richblack-300" : "text-gray-500"
                }`}
              >
                Visualisez et téléchargez votre certificat
              </p>
              <a
                href={pdfUrl}
                download={`certificat-${currentCertificateName}.pdf`}
                className={`flex items-center gap-x-2 rounded-md py-3 px-5 font-semibold transition-all duration-200 ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100 hover:shadow-md"
                    : "bg-[#0a2f59] text-white hover:bg-[#0d3b6d] hover:shadow-md"
                }`}
              >
                <FaFileDownload />
                <span>Télécharger</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
