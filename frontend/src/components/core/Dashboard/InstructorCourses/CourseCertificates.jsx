// frontend/src/components/core/Dashboard/InstructorCourses/CourseCertificates.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUpload,
  FaFileDownload,
  FaSearch,
} from "react-icons/fa";
import {
  getEligibleStudents,
  uploadCertificate,
  getCourseCertificates,
} from "../../../../services/operations/certificateAPI";
import { getQuizDetails } from "../../../../services/operations/quizAPI";
import Loading from "../../../common/Loading";

export default function CourseCertificates() {
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("eligible");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les étudiants éligibles
        const eligibleResponse = await getEligibleStudents(courseId, token);
        if (eligibleResponse?.data) {
          setEligibleStudents(eligibleResponse.data);
        }

        // Récupérer les certificats déjà émis
        const certificatesResponse = await getCourseCertificates(
          courseId,
          token
        );
        if (certificatesResponse?.data) {
          setCertificates(certificatesResponse.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCertificateFile(file);
    } else {
      setCertificateFile(null);
      alert("Veuillez sélectionner un fichier PDF");
    }
  };

  const handleUpload = async () => {
    if (!selectedStudent || !certificateFile) {
      alert("Veuillez sélectionner un étudiant et un fichier de certificat");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("certificate", certificateFile);
      formData.append("courseId", courseId);
      formData.append("studentId", selectedStudent._id);
      formData.append("quizResultId", selectedStudent.quizResultId);

      const response = await uploadCertificate(formData, token);
      if (response?.data) {
        // Rafraîchir les données
        const eligibleResponse = await getEligibleStudents(courseId, token);
        if (eligibleResponse?.data) {
          setEligibleStudents(eligibleResponse.data);
        }

        const certificatesResponse = await getCourseCertificates(
          courseId,
          token
        );
        if (certificatesResponse?.data) {
          setCertificates(certificatesResponse.data);
        }

        // Réinitialiser le formulaire
        setSelectedStudent(null);
        setCertificateFile(null);
      }
    } catch (error) {
      console.error("Erreur lors du téléversement:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewCertificate = async (certificateId) => {
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
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erreur:", error);
      // Vous pouvez ajouter ici une notification d'erreur si vous le souhaitez
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const filteredEligibleStudents = eligibleStudents.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  const filteredCertificates = certificates.filter((cert) => {
    const fullName =
      `${cert.student.firstName} ${cert.student.lastName}`.toLowerCase();
    const email = cert.student.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
            darkMode
              ? "bg-richblack-300 text-richblack-900"
              : "bg-blue-500 text-white hover:bg-blue-400"
          }`}
        >
          <FaArrowLeft />
          Retour
        </button>

        <h1
          className={`text-3xl font-medium ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Gestion des Certificats
        </h1>
      </div>

      <div
        className={`rounded-lg p-6 border ${
          darkMode
            ? "bg-richblack-800 border-richblack-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div
          className={`flex border-b mb-6 ${
            darkMode ? "border-richblack-700" : "border-gray-200"
          }`}
        >
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "eligible"
                ? darkMode
                  ? "text-yellow-50 border-b-2 border-yellow-50"
                  : "text-blue-600 border-b-2 border-blue-600"
                : darkMode
                ? "text-richblack-300 hover:text-richblack-100"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("eligible")}
          >
            Étudiants éligibles ({eligibleStudents.length})
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "issued"
                ? darkMode
                  ? "text-yellow-50 border-b-2 border-yellow-50"
                  : "text-blue-600 border-b-2 border-blue-600"
                : darkMode
                ? "text-richblack-300 hover:text-richblack-100"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("issued")}
          >
            Certificats émis ({certificates.length})
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-1 ${
              darkMode
                ? "bg-richblack-700 text-richblack-5 focus:ring-yellow-50"
                : "bg-gray-50 text-gray-900 border border-gray-300 focus:ring-blue-500"
            }`}
          />
          <FaSearch
            className={`absolute left-3 top-3 ${
              darkMode ? "text-richblack-400" : "text-gray-400"
            }`}
          />
        </div>

        {activeTab === "eligible" && (
          <>
            {eligibleStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p
                  className={`text-xl ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Aucun étudiant éligible pour un certificat
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr
                        className={
                          darkMode ? "bg-richblack-700" : "bg-[#0a2f59]"
                        }
                      >
                        <th
                          className={`p-3 text-left ${
                            darkMode ? "text-richblack-100" : "text-white"
                          }`}
                        >
                          Étudiant
                        </th>
                        <th
                          className={`p-3 text-left ${
                            darkMode ? "text-richblack-100" : "text-white"
                          }`}
                        >
                          Score
                        </th>
                        <th
                          className={`p-3 text-left ${
                            darkMode ? "text-richblack-100" : "text-white"
                          }`}
                        >
                          Date de réussite
                        </th>
                        <th
                          className={`p-3 text-left ${
                            darkMode ? "text-richblack-100" : "text-white"
                          }`}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEligibleStudents.map((student) => (
                        <tr
                          key={student._id}
                          className={`border-b hover:bg-opacity-70 ${
                            darkMode
                              ? `border-richblack-700 hover:bg-richblack-700 ${
                                  selectedStudent?._id === student._id
                                    ? "bg-richblack-700"
                                    : ""
                                }`
                              : `border-gray-200 hover:bg-gray-50 ${
                                  selectedStudent?._id === student._id
                                    ? "bg-gray-100"
                                    : ""
                                }`
                          }`}
                        >
                          <td className="p-3">
                            <div>
                              <p
                                className={`font-medium ${
                                  darkMode
                                    ? "text-richblack-5"
                                    : "text-gray-800"
                                }`}
                              >
                                {student.firstName} {student.lastName}
                              </p>
                              <p
                                className={`text-sm ${
                                  darkMode
                                    ? "text-richblack-300"
                                    : "text-gray-600"
                                }`}
                              >
                                {student.email}
                              </p>
                            </div>
                          </td>
                          <td
                            className={`p-3 ${
                              darkMode ? "text-richblack-5" : "text-gray-800"
                            }`}
                          >
                            {student.score}
                          </td>
                          <td
                            className={`p-3 ${
                              darkMode ? "text-richblack-5" : "text-gray-800"
                            }`}
                          >
                            {formatDate(student.passedAt)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                selectedStudent?._id === student._id
                                  ? darkMode
                                    ? "bg-yellow-50 text-richblack-900"
                                    : "bg-blue-600 text-white"
                                  : darkMode
                                  ? "bg-richblack-700 text-yellow-50 hover:bg-richblack-600"
                                  : "bg-blue-200 text-white hover:bg-blue-300"
                              }`}
                            >
                              Sélectionner
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedStudent && (
                  <div
                    className={`mt-8 p-4 rounded-lg ${
                      darkMode ? "bg-richblack-700" : "bg-gray-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-medium mb-4 ${
                        darkMode ? "text-richblack-5" : "text-gray-800"
                      }`}
                    >
                      Téléverser un certificat pour {selectedStudent.firstName}{" "}
                      {selectedStudent.lastName}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label
                          className={`block text-sm mb-2 ${
                            darkMode ? "text-richblack-300" : "text-gray-600"
                          }`}
                        >
                          Fichier du certificat (PDF)
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className={`w-full rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                            darkMode
                              ? "bg-richblack-800 text-richblack-5 focus:ring-yellow-50"
                              : "bg-white text-gray-900 border border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleUpload}
                          disabled={!certificateFile || uploadLoading}
                          className={`flex items-center gap-x-2 rounded-md py-2 px-4 font-semibold ${
                            certificateFile && !uploadLoading
                              ? darkMode
                                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                              : darkMode
                              ? "bg-richblack-500 text-richblack-300 cursor-not-allowed"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {uploadLoading ? (
                            <>
                              <div
                                className={`animate-spin h-4 w-4 border-2 rounded-full border-t-transparent ${
                                  darkMode
                                    ? "border-richblack-300"
                                    : "border-gray-300"
                                }`}
                              ></div>
                              Téléversement...
                            </>
                          ) : (
                            <>
                              <FaUpload />
                              Téléverser
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "issued" && (
          <>
            {certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p
                  className={`text-xl ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Aucun certificat n'a encore été émis
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr
                      className={darkMode ? "bg-richblack-700" : "bg-[#0a2f59]"}
                    >
                      <th
                        className={`p-3 text-left ${
                          darkMode ? "text-richblack-100" : "text-white"
                        }`}
                      >
                        Étudiant
                      </th>
                      <th
                        className={`p-3 text-left ${
                          darkMode ? "text-richblack-100" : "text-white"
                        }`}
                      >
                        Date d'émission
                      </th>
                      <th
                        className={`p-3 text-left ${
                          darkMode ? "text-richblack-100" : "text-white"
                        }`}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((cert) => (
                      <tr
                        key={cert._id}
                        className={`border-b hover:bg-opacity-70 ${
                          darkMode
                            ? "border-richblack-700 hover:bg-richblack-700"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-3">
                          <div>
                            <p
                              className={`font-medium ${
                                darkMode ? "text-richblack-5" : "text-gray-800"
                              }`}
                            >
                              {cert.student.firstName} {cert.student.lastName}
                            </p>
                            <p
                              className={`text-sm ${
                                darkMode
                                  ? "text-richblack-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {cert.student.email}
                            </p>
                          </div>
                        </td>
                        <td
                          className={`p-3 ${
                            darkMode ? "text-richblack-5" : "text-gray-800"
                          }`}
                        >
                          {formatDate(cert.issuedAt)}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleViewCertificate(cert._id)}
                            className={`flex items-center gap-x-2 px-3 py-1 rounded-md w-fit ${
                              darkMode
                                ? "bg-richblack-700 text-blue-100 hover:bg-richblack-600"
                                : "bg-gray-200 text-blue-700 hover:bg-gray-300"
                            }`}
                          >
                            <FaFileDownload />
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
