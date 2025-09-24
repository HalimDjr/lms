// socket/socketManager.js - Gestion des connexions Socket.IO
const { Server } = require("socket.io");
const Course = require("../models/course");
const { createNotification } = require("../controllers/notificationController");
const { handleStreamEvents } = require("./streamHandlers");

// Map pour stocker les streams actifs
const activeStreams = new Map();

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "responseType"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    console.log("Nouvelle connexion:", socket.id);

    // Gestion des erreurs
    socket.on("error", (error) => {
      console.error("Erreur Socket.IO:", error);
    });

    socket.on("disconnecting", (reason) => {
      console.log(
        "Client en cours de déconnexion:",
        socket.id,
        "Raison:",
        reason
      );
    });

    // Gestion des événements de streaming
    handleStreamEvents(io, socket, activeStreams);
  });

  return io;
}

module.exports = { setupSocketIO };
