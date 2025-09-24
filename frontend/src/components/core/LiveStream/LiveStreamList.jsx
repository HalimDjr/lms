// frontend/src/components/core/LiveStream/LiveStreamList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { FaVideo, FaPlay, FaUsers, FaRegClock } from "react-icons/fa";
import { MdLiveTv } from "react-icons/md";
import { BiRefresh } from "react-icons/bi";
import toast from "react-hot-toast";

const LiveStreamList = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour se connecter au socket et récupérer les streams
  const connectSocket = async () => {
    let socket;
    try {
      // Extraire l'URL de base sans le chemin API
      const baseUrl = import.meta.env.VITE_APP_BASE_URL.split("/api/v1")[0];
      console.log("Tentative de connexion Socket.IO à:", baseUrl);

      // Configuration du socket avec les options appropriées
      socket = io(baseUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        forceNew: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Gérer la connexion réussie
      socket.on("connect", () => {
        console.log("Socket.IO connecté avec succès, ID:", socket.id);
        socket.emit("get-active-streams");
      });

      // Gérer les erreurs de connexion
      socket.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error);
        setError("Erreur de connexion au serveur de streaming");
        setLoading(false);
        setRefreshing(false);
      });

      // Recevoir la liste des streams actifs
      socket.on("active-streams-list", (streams) => {
        console.log("Streams reçus:", streams);
        setLiveStreams(streams);
        setLoading(false);
        setRefreshing(false);
      });

      // Recevoir les mises à jour des streams
      socket.on("stream-started", (streamData) => {
        console.log("Nouveau stream démarré:", streamData);
        setLiveStreams((prev) => [...prev, streamData]);
        toast.success(`Nouveau cours en direct: ${streamData.courseName}`, {
          icon: "🔴",
          duration: 5000,
        });
      });

      socket.on("stream-ended", (courseId) => {
        console.log("Stream terminé:", courseId);
        setLiveStreams((prev) =>
          prev.filter((stream) => stream.courseId !== courseId)
        );
        toast.success(`Un stream vient de se terminer`, {
          icon: "👋",
        });
      });

      return socket;
    } catch (err) {
      console.error("Erreur lors de la configuration de Socket.IO:", err);
      setError("Erreur lors de la connexion au serveur");
      setLoading(false);
      setRefreshing(false);
      return null;
    }
  };

  // Fonction pour rafraîchir manuellement la liste des streams
  const refreshStreams = async () => {
    setRefreshing(true);
    const socket = await connectSocket();

    // Nettoyage après 5 secondes si aucune réponse
    setTimeout(() => {
      if (refreshing) {
        setRefreshing(false);
        if (socket) socket.disconnect();
      }
    }, 5000);
  };

  useEffect(() => {
    let socket;

    const initializeSocket = async () => {
      socket = await connectSocket();
    };

    initializeSocket();

    // Nettoyage à la déconnexion
    return () => {
      if (socket) {
        console.log("Déconnexion du socket");
        socket.disconnect();
      }
    };
  }, []);

  // Charger les détails des cours pour les streams actifs
  useEffect(() => {
    if (liveStreams.length > 0) {
      const fetchCourseDetails = async () => {
        try {
          const updatedStreams = await Promise.all(
            liveStreams.map(async (stream) => {
              try {
                const response = await fetch(
                  `${
                    import.meta.env.VITE_APP_BASE_URL
                  }/course/getCourseDetails`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ courseId: stream.courseId }),
                  }
                );

                const data = await response.json();
                if (data.success) {
                  return {
                    ...stream,
                    courseDetails: data.data.courseDetails,
                  };
                }
                return stream;
              } catch (error) {
                console.error("Error fetching course details:", error);
                return stream;
              }
            })
          );

          setLiveStreams(updatedStreams);
        } catch (error) {
          console.error("Error updating streams:", error);
          setError("Erreur lors du chargement des détails des cours");
        }
      };

      fetchCourseDetails();
    }
  }, [liveStreams.map((stream) => stream.courseId).join(","), token]);

  const joinStream = (courseId) => {
    navigate(`/dashboard/watch-stream/${courseId}`);
  };

  // Fonction pour formater le nombre de spectateurs
  const formatViewerCount = (count) => {
    if (!count) return "0 spectateur";
    return count === 1 ? "1 spectateur" : `${count} spectateurs`;
  };

  if (loading) {
    return (
      <div
        className={`flex flex-col justify-center items-center py-16 ${
          darkMode ? "text-richblack-200" : "text-gray-600"
        }`}
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-50"></div>
          <MdLiveTv
            className={`text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              darkMode ? "text-yellow-50" : "text-blue-600"
            }`}
          />
        </div>
        <p className="mt-4 font-medium">Chargement des streams en direct...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center py-12 px-4 max-w-2xl mx-auto ${
          darkMode ? "text-richblack-300" : "text-gray-600"
        }`}
      >
        <div
          className={`p-6 rounded-xl ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white shadow-lg"
          }`}
        >
          <div
            className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              darkMode ? "bg-red-900/20" : "bg-red-100"
            }`}
          >
            <FaVideo
              className={`text-3xl ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            />
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Erreur de connexion
          </h3>
          <p className="mb-6">{error}</p>
          <button
            onClick={refreshStreams}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${
              darkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <BiRefresh className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Actualisation..." : "Réessayer"}</span>
          </button>
        </div>
      </div>
    );
  }

  if (liveStreams.length === 0) {
    return (
      <div className={`text-center py-16 px-4 max-w-2xl mx-auto`}>
        <div
          className={`p-8 rounded-xl ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white shadow-lg"
          }`}
        >
          <div
            className={`h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              darkMode ? "bg-richblack-700" : "bg-gray-100"
            }`}
          >
            <MdLiveTv
              className={`text-4xl ${
                darkMode ? "text-richblack-400" : "text-gray-400"
              }`}
            />
          </div>
          <h2
            className={`text-2xl font-bold mb-3 ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Aucun cours en direct
          </h2>
          <p
            className={`mb-6 max-w-md mx-auto ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Il n'y a actuellement aucun cours diffusé en direct. Revenez plus
            tard ou consultez nos cours enregistrés.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={refreshStreams}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BiRefresh className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Actualisation..." : "Actualiser"}</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/enrolled-courses")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaPlay size={14} />
              <span>Voir mes cours</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton d'actualisation */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Cours en direct
          </h1>
          <p
            className={`mt-1 ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            {liveStreams.length}{" "}
            {liveStreams.length === 1 ? "cours diffusé" : "cours diffusés"} en
            ce moment
          </p>
        </div>
        <button
          onClick={refreshStreams}
          disabled={refreshing}
          className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
            darkMode
              ? "bg-richblack-800 hover:bg-richblack-700 text-richblack-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          title="Actualiser la liste"
        >
          <BiRefresh
            className={`text-xl ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">
            {refreshing ? "Actualisation..." : "Actualiser"}
          </span>
        </button>
      </div>

      {/* Grille des streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveStreams.map((stream) => (
          <div
            key={stream.courseId}
            className={`rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:translate-y-[-4px] ${
              darkMode
                ? "bg-richblack-800 border border-richblack-700 hover:shadow-lg hover:shadow-richblack-900/40"
                : "bg-white hover:shadow-xl border border-gray-100"
            }`}
          >
            <div className="relative group">
              {/* Thumbnail */}
              {stream.courseDetails?.thumbnail ? (
                <img
                  src={stream.courseDetails.thumbnail}
                  alt={stream.courseName}
                  className="w-full h-52 object-cover group-hover:brightness-90 transition-all duration-300"
                />
              ) : (
                <div
                  className={`w-full h-52 flex items-center justify-center ${
                    darkMode ? "bg-richblack-700" : "bg-gray-200"
                  }`}
                >
                  <FaVideo
                    size={48}
                    className={
                      darkMode ? "text-richblack-400" : "text-gray-400"
                    }
                  />
                </div>
              )}

              {/* Overlay de lecture */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-black/60" : "bg-black/50"
                  }`}
                >
                  <FaPlay className="text-white text-xl ml-1" />
                </div>
              </div>

              {/* Badge LIVE */}
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-medium">LIVE</span>
              </div>

              {/* Nombre de spectateurs */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <FaUsers size={14} />
                <span className="text-sm">
                  {formatViewerCount(stream.viewerCount || 0)}
                </span>
              </div>

              {/* Durée du stream (fictive) */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <FaRegClock size={14} />
                <span className="text-sm">En direct</span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3
                  className={`text-lg font-bold line-clamp-2 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {stream.courseDetails?.courseName || stream.courseName}
                </h3>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-richblack-700" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    {(stream.instructorName || "").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    {stream.instructorName || "Instructeur"}
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-richblack-400" : "text-gray-500"
                    }`}
                  >
                    Instructeur
                  </p>
                </div>
              </div>

              <button
                onClick={() => joinStream(stream.courseId)}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <MdLiveTv size={18} />
                <span>Rejoindre le stream</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStreamList;
