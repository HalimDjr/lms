import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import Peer from "simple-peer";
import { FaUsers, FaArrowLeft, FaRegClock } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdLiveTv, MdScreenShare } from "react-icons/md";
import { BsShieldCheck, BsPersonVideo3 } from "react-icons/bs";
import toast from "react-hot-toast";

const LiveStreamViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [stream, setStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [instructorName, setInstructorName] = useState("");
  const [instructorImage, setInstructorImage] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const socketRef = useRef();
  const peerRef = useRef();
  const videoRef = useRef();
  const videoContainerRef = useRef();
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Démarrer le timer pour la durée du stream
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    // Fetch course details
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/course/getCourseDetails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId }),
          }
        );

        const data = await response.json();
        if (data.success && mounted) {
          setCourseDetails(data.data.courseDetails);
          if (data.data.courseDetails.instructor) {
            const instructor = data.data.courseDetails.instructor;
            setInstructorName(`${instructor.firstName} ${instructor.lastName}`);
            setInstructorImage(instructor.image || "");
          }

          // Une fois que les détails du cours sont chargés, initialiser la connexion
          initializeConnection();
        } else if (mounted) {
          toast.error("Impossible de charger les détails du cours");
          navigate("/dashboard/enrolled-courses");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        if (mounted) {
          toast.error("Une erreur s'est produite");
          navigate("/dashboard/enrolled-courses");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourseDetails();

    return () => {
      mounted = false;
      console.log("Nettoyage des ressources");

      // Arrêter le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Nettoyer proprement les ressources
      cleanupResources();
    };
  }, []);

  // Formater la durée du stream
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // Fonction pour nettoyer les ressources
  const cleanupResources = () => {
    console.log("Nettoyage des ressources");

    // Envoyer l'événement de départ avant de se déconnecter
    if (socketRef.current && socketRef.current.connected) {
      console.log("Envoi de l'événement leave-stream");
      try {
        socketRef.current.emit("leave-stream", {
          courseId,
          viewerId: user._id,
        });
        socketRef.current.disconnect();
      } catch (error) {
        console.error("Erreur lors de la déconnexion du socket:", error);
      }
    }

    // Détruire le peer
    if (peerRef.current) {
      console.log("Destruction du peer");
      try {
        peerRef.current.destroy();
      } catch (error) {
        console.error("Erreur lors de la destruction du peer:", error);
      }
    }

    // Arrêter tous les tracks du stream
    if (stream) {
      console.log("Arrêt des tracks du stream");
      try {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Track arrêté:", track.kind);
        });
      } catch (error) {
        console.error("Erreur lors de l'arrêt des tracks:", error);
      }
    }

    // Nettoyer la source vidéo
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  };

  // Initialiser la connexion Socket.IO
  const initializeConnection = () => {
    try {
      // Extraire l'URL de base sans le chemin API
      const baseUrl = import.meta.env.VITE_APP_BASE_URL.split("/api/v1")[0];
      console.log("Tentative de connexion Socket.IO à:", baseUrl);

      // Configuration du socket avec les options appropriées
      socketRef.current = io(baseUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        forceNew: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Gérer la connexion réussie
      socketRef.current.on("connect", () => {
        console.log(
          "Socket.IO connecté avec succès, ID:",
          socketRef.current.id
        );

        // Join stream
        socketRef.current.emit("join-stream", {
          courseId,
          viewerId: user._id,
          viewerName: `${user.firstName} ${user.lastName}`,
        });
      });

      // Gérer les erreurs de connexion
      socketRef.current.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error);
        setError("Erreur de connexion au serveur de streaming");
        setIsLoading(false);
      });

      // Handle stream signal
      socketRef.current.on("stream-signal", (signal) => {
        console.log("Signal de stream reçu de l'instructeur");

        try {
          // Créer un nouveau peer
          peerRef.current = new Peer({
            initiator: false,
            trickle: false,
            config: {
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" },
              ],
            },
          });

          // Envoyer le signal de retour à l'instructeur
          peerRef.current.on("signal", (returnSignal) => {
            console.log("Signal de retour généré, envoi à l'instructeur");
            socketRef.current.emit("return-signal", {
              signal: returnSignal,
              courseId,
              viewerId: user._id,
            });
          });

          // Recevoir le stream
          peerRef.current.on("stream", (incomingStream) => {
            console.log("Stream reçu de l'instructeur");
            if (videoRef.current) {
              videoRef.current.srcObject = incomingStream;
              setStream(incomingStream);
              setIsConnected(true);
            }
          });

          // Gérer les erreurs
          peerRef.current.on("error", (err) => {
            console.error("Erreur Peer:", err);
            toast.error("Erreur de connexion au stream");
          });

          // Traiter le signal reçu
          peerRef.current.signal(signal);
        } catch (error) {
          console.error("Erreur lors de la création du peer:", error);
        }
      });

      // Handle viewer count updates
      socketRef.current.on("viewer-count-update", (count) => {
        console.log("Mise à jour du nombre de spectateurs:", count);
        setViewerCount(count);
      });

      // Handle screen sharing updates
      socketRef.current.on("screen-sharing-started", () => {
        console.log("Partage d'écran démarré");
        setIsScreenSharing(true);
        toast.success("L'instructeur partage son écran");
      });

      socketRef.current.on("screen-sharing-stopped", () => {
        console.log("Partage d'écran arrêté");
        setIsScreenSharing(false);
        toast.info("Partage d'écran terminé");
      });

      // Handle stream ended
      socketRef.current.on("stream-ended", () => {
        console.log("Stream terminé par l'instructeur");
        toast.info("Le stream a été terminé par l'instructeur");
        cleanupResources();
        navigate("/dashboard/enrolled-courses");
      });

      // Handle no active stream
      socketRef.current.on("no-active-stream", () => {
        console.log("Aucun stream actif");
        toast.error("Aucun stream actif pour ce cours");
        cleanupResources();
        navigate("/dashboard/enrolled-courses");
      });
    } catch (err) {
      console.error("Erreur lors de l'initialisation de la connexion:", err);
      toast.error("Impossible de se connecter au serveur");
      setIsLoading(false);
    }
  };

  // Leave stream
  const leaveStream = () => {
    console.log("Quitter le stream");

    try {
      // Nettoyer proprement les ressources
      cleanupResources();

      // Afficher un message
      toast.info("Vous avez quitté le stream");

      // Naviguer vers la page des cours
      setTimeout(() => {
        navigate("/dashboard/enrolled-courses");
      }, 100); // Petit délai pour s'assurer que le nettoyage est terminé
    } catch (error) {
      console.error("Erreur lors de la sortie du stream:", error);
      // Naviguer même en cas d'erreur
      navigate("/dashboard/enrolled-courses");
    }
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Écouter les changements d'état du mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-screen flex-col ${
          darkMode ? "bg-richblack-900" : "bg-gray-100"
        }`}
      >
        <div
          className={`p-8 rounded-xl max-w-md text-center ${
            darkMode ? "bg-richblack-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="mb-6 flex justify-center">
            <div
              className={`p-4 rounded-full ${
                darkMode ? "bg-red-900/20" : "bg-red-100"
              }`}
            >
              <IoMdClose
                className={`text-4xl ${
                  darkMode ? "text-red-500" : "text-red-600"
                }`}
              />
            </div>
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Erreur de connexion
          </h2>
          <p
            className={`mb-6 ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              darkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "bg-richblack-900" : "bg-gray-100"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-50"></div>
            <MdLiveTv
              className={`text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                darkMode ? "text-yellow-50" : "text-blue-600"
              }`}
            />
          </div>
          <p
            className={`mt-4 ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Connexion au stream en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-richblack-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div
        className={`py-4 px-6 ${
          darkMode ? "bg-richblack-800" : "bg-white"
        } shadow-sm`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-richblack-700 text-richblack-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <FaArrowLeft />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 py-1.5 px-3 rounded-full ${
                darkMode
                  ? "bg-richblack-700 text-yellow-50"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <FaRegClock size={14} />
              <span>{formatDuration(streamDuration)}</span>
            </div>

            <div
              className={`flex items-center gap-2 py-1.5 px-3 rounded-full ${
                darkMode
                  ? "bg-red-900/20 text-red-400"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>

            <div
              className={`flex items-center gap-2 py-1.5 px-3 rounded-full ${
                darkMode
                  ? "bg-richblack-700 text-richblack-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <FaUsers size={14} />
              <span>{viewerCount} spectateurs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Stream Section */}
          <div className="lg:w-3/4 flex flex-col gap-6">
            {/* Stream Title */}
            <div
              className={`rounded-xl overflow-hidden shadow-lg ${
                darkMode ? "bg-richblack-800" : "bg-white"
              }`}
            >
              <div className="p-5">
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {courseDetails?.courseName || "Cours en direct"}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`h-8 w-8 rounded-full overflow-hidden border-2 ${
                      darkMode ? "border-yellow-50" : "border-blue-500"
                    }`}
                  >
                    {instructorImage ? (
                      <img
                        src={instructorImage}
                        alt={instructorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full flex items-center justify-center ${
                          darkMode ? "bg-richblack-700" : "bg-blue-100"
                        }`}
                      >
                        <span
                          className={darkMode ? "text-white" : "text-blue-600"}
                        >
                          {instructorName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      {instructorName || "Instructeur"}
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
              </div>
            </div>

            {/* Video Stream */}
            <div
              ref={videoContainerRef}
              className={`rounded-xl overflow-hidden shadow-lg ${
                darkMode ? "bg-richblack-800" : "bg-white"
              } ${isFullScreen ? "fixed inset-0 z-50 bg-black" : ""}`}
            >
              <div className="relative">
                {isConnected ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    className={`w-full aspect-video ${
                      isScreenSharing
                        ? "object-contain bg-black"
                        : "object-cover"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full aspect-video flex items-center justify-center ${
                      darkMode ? "bg-richblack-900" : "bg-gray-800"
                    }`}
                  >
                    <div className="text-center">
                      <div className="relative mx-auto mb-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-50"></div>
                        <MdLiveTv className="text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-50" />
                      </div>
                      <p className="text-white font-medium">
                        Connexion au stream...
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Veuillez patienter
                      </p>
                    </div>
                  </div>
                )}

                {/* Stream Info Overlay */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">LIVE</span>
                  </div>
                </div>

                {/* Viewers Count */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaUsers />
                  <span>{viewerCount}</span>
                </div>

                {/* Screen Sharing Indicator */}
                {isScreenSharing && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <MdScreenShare size={18} />
                    <span>Partage d'écran en cours</span>
                  </div>
                )}

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullScreen}
                  className="absolute bottom-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-80 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isFullScreen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V15H5M19 19H15V15M9 5V9H5M19 5H15V9"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4M4 4H8M4 4L9 9M20 8V4M20 4H16M20 4L15 9M4 16V20M4 20H8M4 20L9 15M20 16V20M20 20H16M20 20L15 15"
                      />
                    )}
                  </svg>
                </button>
              </div>

              {/* Controls */}
              <div
                className={`p-5 flex justify-center ${
                  darkMode ? "bg-richblack-700" : "bg-gray-50"
                }`}
              >
                <button
                  onClick={leaveStream}
                  className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                    darkMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  }`}
                  title="Quitter le stream"
                >
                  <IoMdClose size={20} />
                  <span>Quitter le stream</span>
                </button>
              </div>
            </div>

            {/* Course Info */}
            <div
              className={`rounded-xl p-5 ${
                darkMode ? "bg-richblack-800" : "bg-white"
              } shadow-lg`}
            >
              <h2
                className={`text-xl font-bold mb-3 flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <BsShieldCheck
                  className={darkMode ? "text-yellow-50" : "text-blue-600"}
                />
                À propos du cours
              </h2>
              <p
                className={`${
                  darkMode ? "text-richblack-300" : "text-gray-600"
                } leading-relaxed`}
              >
                {courseDetails?.courseDescription ||
                  "Description non disponible"}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div
              className={`rounded-xl shadow-lg overflow-hidden sticky top-6 ${
                darkMode ? "bg-richblack-800" : "bg-white"
              }`}
            >
              <div
                className={`p-4 border-b ${
                  darkMode
                    ? "border-richblack-700 text-white"
                    : "border-gray-200 text-gray-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BsPersonVideo3
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                    />
                    <span>Informations</span>
                  </h2>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-richblack-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FaUsers
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                      size={14}
                    />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Participants
                    </span>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {viewerCount}{" "}
                    {viewerCount <= 1 ? "spectateur" : "spectateurs"}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-richblack-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FaRegClock
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                      size={14}
                    />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Durée du stream
                    </span>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {formatDuration(streamDuration)}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-richblack-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MdLiveTv
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                      size={14}
                    />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Statut
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode
                          ? "bg-red-900/30 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      En direct
                    </span>
                    {isScreenSharing && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <MdScreenShare size={12} />
                        Partage d'écran
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-richblack-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BsShieldCheck
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                      size={14}
                    />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-richblack-100" : "text-gray-700"
                      }`}
                    >
                      Instructeur
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`h-8 w-8 rounded-full overflow-hidden border ${
                        darkMode ? "border-richblack-600" : "border-gray-200"
                      }`}
                    >
                      {instructorImage ? (
                        <img
                          src={instructorImage}
                          alt={instructorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`h-full w-full flex items-center justify-center ${
                            darkMode ? "bg-richblack-600" : "bg-gray-100"
                          }`}
                        >
                          <span
                            className={
                              darkMode ? "text-white" : "text-gray-600"
                            }
                          >
                            {instructorName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {instructorName || "Instructeur"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className={`p-4 border-t ${
                  darkMode ? "border-richblack-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={leaveStream}
                  className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    darkMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  <IoMdClose size={18} />
                  <span>Quitter le stream</span>
                </button>

                <button
                  onClick={toggleFullScreen}
                  className={`w-full mt-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isFullScreen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V15H5M19 19H15V15M9 5V9H5M19 5H15V9"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4M4 4H8M4 4L9 9M20 8V4M20 4H16M20 4L15 9M4 16V20M4 20H8M4 20L9 15M20 16V20M20 20H16M20 20L15 15"
                      />
                    )}
                  </svg>
                  <span>
                    {isFullScreen
                      ? "Quitter le plein écran"
                      : "Mode plein écran"}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/enrolled-courses/view-course/${courseId}`
                    )
                  }
                  className={`w-full mt-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    darkMode
                      ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>Voir le cours</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;
