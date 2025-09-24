// frontend/src/components/core/LiveStream/LiveStreamHost.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaUsers,
  FaArrowLeft,
  FaRegClock,
} from "react-icons/fa";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";

const LiveStreamHost = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);

  const socketRef = useRef();
  const videoRef = useRef();
  const screenRef = useRef();
  const peersRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

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

          // Une fois que les détails du cours sont chargés, initialiser le stream
          initializeStream(data.data.courseDetails);

          // Démarrer le timer pour la durée du stream
          timerRef.current = setInterval(() => {
            setStreamDuration((prev) => prev + 1);
          }, 1000);
        } else if (mounted) {
          toast.error("Impossible de charger les détails du cours");
          navigate("/dashboard/my-courses");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        if (mounted) {
          toast.error("Une erreur s'est produite");
          navigate("/dashboard/my-courses");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourseDetails();

    // Ajouter un gestionnaire pour la fermeture de la page
    const handleBeforeUnload = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      mounted = false;

      // Arrêter le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Clean up
      if (socketRef.current) {
        socketRef.current.emit("end-stream", { courseId });
        socketRef.current.disconnect();
      }

      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }

      // Destroy all peer connections
      peersRef.current.forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.destroy();
        }
      });

      // Supprimer le gestionnaire d'événement
      window.removeEventListener("beforeunload", handleBeforeUnload);
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

  // Initialiser le stream
  const initializeStream = (courseDetails) => {
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

        // Get user media
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((mediaStream) => {
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }

            // Inform server that instructor is starting a stream
            socketRef.current.emit("start-stream", {
              instructorId: user._id,
              courseId,
              courseName: courseDetails?.courseName || "Cours en direct",
              instructorName: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
            });
          })
          .catch((err) => {
            console.error("Error accessing media devices:", err);
            toast.error("Impossible d'accéder à votre caméra ou microphone");
            navigate("/dashboard/my-courses");
          });
      });

      // Gestionnaire pour les nouveaux viewers
      socketRef.current.on("viewer-joined", ({ viewerId, viewerName }) => {
        console.log("Nouveau spectateur:", viewerName, "ID:", viewerId);

        // Vérifier si le viewer n'est pas déjà dans la liste
        setViewers((prevViewers) => {
          if (prevViewers.some((v) => v.id === viewerId)) {
            console.log("Viewer déjà présent dans la liste");
            return prevViewers;
          }

          toast.success(`${viewerName} a rejoint le stream`);

          try {
            // Créer un nouveau peer pour ce viewer
            const peer = new Peer({
              initiator: true,
              trickle: false,
              config: {
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" },
                  { urls: "stun:global.stun.twilio.com:3478" },
                ],
              },
              stream: isScreenSharing ? screenStream : stream,
            });

            // Envoyer le signal au viewer quand il est généré
            peer.on("signal", (signal) => {
              console.log("Signal généré pour le viewer:", viewerId);
              socketRef.current.emit("stream-signal", {
                viewerId,
                signal,
              });
            });

            // Gérer les erreurs
            peer.on("error", (err) => {
              console.error("Erreur Peer:", err);
            });

            // Ajouter le peer à la liste seulement s'il n'existe pas déjà
            if (!peersRef.current.some((p) => p.peerId === viewerId)) {
              peersRef.current.push({
                peerId: viewerId,
                peer,
                name: viewerName,
              });
            }

            return [...prevViewers, { id: viewerId, name: viewerName }];
          } catch (error) {
            console.error("Erreur lors de la création du peer:", error);
            return prevViewers;
          }
        });
      });

      // Gestionnaire pour les viewers qui quittent
      socketRef.current.on("viewer-left", (viewerId) => {
        console.log("Spectateur parti:", viewerId);

        setViewers((prevViewers) => {
          const leavingViewer = prevViewers.find((v) => v.id === viewerId);
          if (leavingViewer) {
            toast(
              `${leavingViewer.name || "Un participant"} a quitté le stream`
            );
          }

          // Mettre à jour la liste des peers
          const peerObj = peersRef.current.find((p) => p.peerId === viewerId);
          if (peerObj) {
            try {
              peerObj.peer.destroy();
            } catch (error) {
              console.error("Erreur lors de la destruction du peer:", error);
            }
          }
          peersRef.current = peersRef.current.filter(
            (p) => p.peerId !== viewerId
          );

          // Retourner la nouvelle liste de viewers
          return prevViewers.filter((v) => v.id !== viewerId);
        });

        // Demander une mise à jour complète de la liste
        socketRef.current.emit("get-viewers-list", { courseId });
      });

      // Gestionnaire pour les signaux de retour
      socketRef.current.on("receiving-returned-signal", (payload) => {
        console.log("Signal de retour reçu de:", payload.id);
        try {
          const item = peersRef.current.find((p) => p.peerId === payload.id);
          if (item && item.peer) {
            item.peer.signal(payload.signal);
          } else {
            console.warn(
              "Peer non trouvé pour le signal de retour:",
              payload.id
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors du traitement du signal de retour:",
            error
          );
        }
      });

      // Gestionnaire pour la mise à jour du nombre de viewers
      socketRef.current.on("viewer-count-update", (count) => {
        console.log("Mise à jour du nombre de spectateurs:", count);
        setViewers((prevViewers) => {
          // Si le nombre de viewers est différent, demander une mise à jour complète
          if (prevViewers.length !== count) {
            socketRef.current.emit("get-viewers-list", { courseId });
          }
          return prevViewers;
        });
      });

      // Gestionnaire pour recevoir la liste complète des viewers
      socketRef.current.on("viewers-list", (viewersList) => {
        console.log("Liste des spectateurs mise à jour:", viewersList);
        setViewers(viewersList);
      });

      // Gérer les erreurs de connexion
      socketRef.current.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error);
        setError("Erreur de connexion au serveur de streaming");
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Erreur lors de l'initialisation du stream:", err);
      toast.error("Impossible de démarrer le stream");
      navigate("/dashboard/my-courses");
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }

      setIsScreenSharing(false);

      // Update all peers with camera stream
      peersRef.current.forEach((peerObj) => {
        if (stream) {
          try {
            stream.getTracks().forEach((track) => {
              if (
                peerObj.peer &&
                peerObj.peer._senderMap &&
                peerObj.peer._senderMap.get(track.kind)
              ) {
                peerObj.peer.replaceTrack(
                  peerObj.peer._senderMap.get(track.kind).track,
                  track,
                  stream
                );
              }
            });
          } catch (error) {
            console.error("Error replacing track:", error);
          }
        }
      });

      // Notify viewers
      socketRef.current.emit("screen-sharing-stopped", { courseId });
    } else {
      try {
        // Start screen sharing
        const displayMedia = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        setScreenStream(displayMedia);
        setIsScreenSharing(true);

        if (screenRef.current) {
          screenRef.current.srcObject = displayMedia;
        }

        // Update all peers with screen stream
        peersRef.current.forEach((peerObj) => {
          try {
            displayMedia.getTracks().forEach((track) => {
              if (
                peerObj.peer &&
                peerObj.peer._senderMap &&
                peerObj.peer._senderMap.get(track.kind)
              ) {
                peerObj.peer.replaceTrack(
                  peerObj.peer._senderMap.get(track.kind).track,
                  track,
                  displayMedia
                );
              }
            });
          } catch (error) {
            console.error("Error replacing track with screen share:", error);
          }
        });

        // Handle when user stops sharing screen via browser UI
        displayMedia.getVideoTracks()[0].onended = () => {
          toggleScreenSharing();
        };

        // Notify viewers
        socketRef.current.emit("screen-sharing-started", { courseId });
      } catch (err) {
        console.error("Error starting screen share:", err);
        toast.error("Impossible de partager votre écran");
      }
    }
  };

  // End stream
  const endStream = () => {
    if (confirm("Êtes-vous sûr de vouloir terminer ce stream ?")) {
      // Arrêter tous les flux média avant de naviguer
      const stopAllMediaTracks = () => {
        // Arrêter les flux de la caméra/micro
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          setStream(null);
        }

        // Arrêter le flux de partage d'écran s'il existe
        if (screenStream) {
          screenStream.getTracks().forEach((track) => {
            track.stop();
          });
          setScreenStream(null);
        }

        console.log("Tous les flux média ont été arrêtés");
      };

      // Informer le serveur que le stream est terminé
      if (socketRef.current) {
        socketRef.current.emit("end-stream", { courseId });
      }

      // Arrêter tous les flux média
      stopAllMediaTracks();

      // Détruire toutes les connexions peer
      peersRef.current.forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.destroy();
        }
      });
      peersRef.current = [];

      // Naviguer vers la page des cours
      navigate("/dashboard/my-courses");
    }
  };

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
            onClick={() => navigate("/dashboard/my-courses")}
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-50"></div>
          <p
            className={`mt-4 ${
              darkMode ? "text-richblack-300" : "text-gray-600"
            }`}
          >
            Préparation du stream en cours...
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
            onClick={() => navigate("/dashboard/my-courses")}
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
              <span>{viewers.length} spectateurs</span>
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
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.firstName}
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
                          {user?.firstName?.charAt(0)}
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
                      {user?.firstName} {user?.lastName}
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
              className={`rounded-xl overflow-hidden shadow-lg ${
                darkMode ? "bg-richblack-800" : "bg-white"
              }`}
            >
              <div className="relative">
                {/* Main Video */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className={`w-full aspect-video object-cover ${
                    isVideoOff ? "hidden" : ""
                  }`}
                />

                {/* Screen Share Video */}
                {isScreenSharing && (
                  <video
                    ref={screenRef}
                    autoPlay
                    className="w-full aspect-video object-contain"
                  />
                )}

                {/* Video Off Placeholder */}
                {isVideoOff && !isScreenSharing && (
                  <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
                    <div
                      className={`h-32 w-32 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-richblack-700" : "bg-gray-700"
                      }`}
                    >
                      <span className="text-4xl text-white">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </span>
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
                  <span>{viewers.length}</span>
                </div>
              </div>

              {/* Controls */}
              <div
                className={`p-5 flex justify-center gap-4 ${
                  darkMode ? "bg-richblack-700" : "bg-gray-50"
                }`}
              >
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-all ${
                    isAudioMuted
                      ? darkMode
                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/40"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                      : darkMode
                      ? "bg-richblack-600 text-white hover:bg-richblack-500"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                  title={isAudioMuted ? "Activer le micro" : "Couper le micro"}
                >
                  {isAudioMuted ? (
                    <FaMicrophoneSlash size={22} />
                  ) : (
                    <FaMicrophone size={22} />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${
                    isVideoOff
                      ? darkMode
                        ? "bg-red-900/30 text-red-400 hover:bg-red-900/40"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                      : darkMode
                      ? "bg-richblack-600 text-white hover:bg-richblack-500"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                  title={isVideoOff ? "Activer la caméra" : "Couper la caméra"}
                >
                  {isVideoOff ? (
                    <FaVideoSlash size={22} />
                  ) : (
                    <FaVideo size={22} />
                  )}
                </button>

                <button
                  onClick={toggleScreenSharing}
                  className={`p-4 rounded-full transition-all ${
                    isScreenSharing
                      ? darkMode
                        ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                      : darkMode
                      ? "bg-richblack-600 text-white hover:bg-richblack-500"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                  }`}
                  title={
                    isScreenSharing
                      ? "Arrêter le partage d'écran"
                      : "Partager l'écran"
                  }
                >
                  {isScreenSharing ? (
                    <MdStopScreenShare size={22} />
                  ) : (
                    <MdScreenShare size={22} />
                  )}
                </button>

                <button
                  onClick={endStream}
                  className={`p-4 rounded-full transition-all ${
                    darkMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  }`}
                  title="Terminer le stream"
                >
                  <IoMdClose size={22} />
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

          {/* Viewers Section */}
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
                    <FaUsers
                      className={darkMode ? "text-yellow-50" : "text-blue-600"}
                    />
                    <span>Participants</span>
                  </h2>
                  <div
                    className={`px-2.5 py-1 rounded-full text-sm ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-100"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {viewers.length}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-richblack-300" : "text-gray-500"
                    }`}
                  >
                    {viewers.length === 0
                      ? "Aucun participant pour le moment"
                      : viewers.length === 1
                      ? "1 participant connecté"
                      : `${viewers.length} participants connectés`}
                  </span>
                  <button
                    onClick={() => {
                      if (socketRef.current) {
                        socketRef.current.emit("get-viewers-list", {
                          courseId,
                        });
                      }
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode
                        ? "bg-richblack-700 hover:bg-richblack-600 text-richblack-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    title="Rafraîchir la liste"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {viewers.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center py-10 rounded-lg border border-dashed ${
                      darkMode
                        ? "border-richblack-700 bg-richblack-900/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <FaUsers
                      className={`text-3xl mb-3 ${
                        darkMode ? "text-richblack-400" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-center ${
                        darkMode ? "text-richblack-400" : "text-gray-500"
                      }`}
                    >
                      En attente de participants
                    </p>
                    <p
                      className={`text-center text-sm mt-1 ${
                        darkMode ? "text-richblack-500" : "text-gray-400"
                      }`}
                    >
                      Les participants apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2">
                    {viewers.map((viewer) => (
                      <div
                        key={viewer.id}
                        className={`p-3 rounded-lg transition-all ${
                          darkMode
                            ? "bg-richblack-700 hover:bg-richblack-600"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center ${
                              darkMode
                                ? "bg-richblack-600 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <span className="font-medium">
                              {viewer.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${
                                darkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {viewer.name || "Anonyme"}
                            </p>
                            <p
                              className={`text-xs ${
                                darkMode
                                  ? "text-richblack-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Spectateur
                            </p>
                          </div>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              darkMode ? "bg-green-400" : "bg-green-500"
                            }`}
                            title="En ligne"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div
                className={`p-4 border-t ${
                  darkMode ? "border-richblack-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`text-sm font-medium mb-2 ${
                    darkMode ? "text-richblack-300" : "text-gray-500"
                  }`}
                >
                  Informations du stream
                </h3>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-sm ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    <span>Durée</span>
                    <span className="font-medium">
                      {formatDuration(streamDuration)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between text-sm ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    <span>Statut</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        darkMode
                          ? "bg-red-900/30 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      En direct
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between text-sm ${
                      darkMode ? "text-richblack-100" : "text-gray-700"
                    }`}
                  >
                    <span>Qualité</span>
                    <span className="font-medium">Auto (HD)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamHost;
