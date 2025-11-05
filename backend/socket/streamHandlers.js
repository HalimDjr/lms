//- Gestion des événements de streaming
const Course = require("../models/course");
const { createNotification } = require("../controllers/notificationController");

// Fonction pour gérer la déconnexion d'un viewer
function handleViewerDisconnect(io, socketId, courseId, activeStreams) {
  console.log(`Déconnexion du viewer ${socketId} du cours ${courseId}`);

  const streamData = activeStreams.get(courseId);
  if (!streamData) {
    console.log(`Aucun stream actif trouvé pour le cours ${courseId}`);
    return;
  }

  if (!streamData.viewers.has(socketId)) {
    console.log(`Viewer ${socketId} non trouvé dans le stream ${courseId}`);
    return;
  }

  const viewerData = streamData.viewers.get(socketId);
  console.log(`Viewer trouvé:`, viewerData);

  // Informer l'instructeur qu'un viewer est parti
  if (streamData.instructorSocketId) {
    console.log(
      `Notification à l'instructeur ${streamData.instructorSocketId}`
    );
    io.to(streamData.instructorSocketId).emit("viewer-left", socketId);
  }

  // Supprimer le viewer de la liste
  streamData.viewers.delete(socketId);
  console.log(`Viewer supprimé, nombre restant: ${streamData.viewers.size}`);

  // Créer la liste mise à jour des viewers
  const updatedViewersList = Array.from(streamData.viewers.entries()).map(
    ([id, data]) => ({
      id,
      name: data.viewerName,
      viewerId: data.viewerId,
    })
  );

  // Envoyer la liste mise à jour à tous les participants
  io.to(courseId).emit("viewers-list", updatedViewersList);

  // Mettre à jour le nombre de viewers
  io.to(courseId).emit("viewer-count-update", streamData.viewers.size);
}

// Fonction pour envoyer des notifications aux étudiants inscrits
async function notifyEnrolledStudents(courseId, courseName, instructorName) {
  try {
    // Récupérer le cours avec les étudiants inscrits
    const course = await Course.findById(courseId);

    if (
      !course ||
      !course.studentsEnrolled ||
      course.studentsEnrolled.length === 0
    ) {
      console.log(`Aucun étudiant inscrit trouvé pour le cours ${courseId}`);
      return;
    }

    console.log(
      `Envoi de notifications à ${course.studentsEnrolled.length} étudiants pour le cours ${courseName}`
    );

    // Message de notification
    const notificationMessage = `Un cours en direct "${courseName}" avec ${instructorName} vient de commencer.`;
    const notificationType = "live-stream-started";
    const notificationTarget = `/dashboard/live-streams`;

    // Envoyer une notification à chaque étudiant inscrit
    for (const studentId of course.studentsEnrolled) {
      await createNotification(
        studentId,
        notificationMessage,
        notificationType,
        notificationTarget
      );
    }

    console.log(
      `Notifications envoyées avec succès aux étudiants du cours ${courseId}`
    );
  } catch (error) {
    console.error(`Erreur lors de l'envoi des notifications: ${error.message}`);
  }
}

function handleStreamEvents(io, socket, activeStreams) {
  // Demande de liste des viewers
  socket.on("get-viewers-list", ({ courseId }) => {
    console.log("Demande de liste des viewers pour le cours:", courseId);

    const streamData = activeStreams.get(courseId);
    if (streamData) {
      const viewersList = Array.from(streamData.viewers.entries()).map(
        ([id, data]) => ({
          id,
          name: data.viewerName,
          viewerId: data.viewerId,
        })
      );

      socket.emit("viewers-list", viewersList);
    } else {
      socket.emit("viewers-list", []);
    }
  });

  // Demande de liste des streams actifs
  socket.on("get-active-streams", () => {
    console.log("Demande de liste des streams actifs reçue");
    const activeStreamsList = [];

    activeStreams.forEach((streamData, courseId) => {
      activeStreamsList.push({
        courseId,
        instructorId: streamData.instructorId,
        instructorName: streamData.instructorName || "Instructeur",
        courseName: streamData.courseName || "Cours en direct",
        viewerCount: streamData.viewers.size,
      });
    });

    console.log("Envoi de la liste des streams:", activeStreamsList);
    socket.emit("active-streams-list", activeStreamsList);
  });

  // Instructeur démarre un stream
  socket.on("start-stream", async (data) => {
    console.log("Stream démarré:", data);
    const { instructorId, courseId, courseName, instructorName } = data;

    // Enregistrer le stream actif
    const displayName =
      instructorName || `${data.firstName} ${data.lastName}` || "Instructeur";

    activeStreams.set(courseId, {
      instructorId,
      instructorSocketId: socket.id,
      courseName,
      instructorName: displayName,
      viewers: new Map(),
    });

    // Informer tous les clients qu'un nouveau stream a démarré
    io.emit("stream-started", {
      courseId,
      instructorId,
      courseName,
      instructorName: displayName,
      viewerCount: 0,
    });

    // Rejoindre la salle du cours
    socket.join(courseId);

    // Envoyer des notifications aux étudiants inscrits
    await notifyEnrolledStudents(courseId, courseName, displayName);
  });

  // Étudiant rejoint un stream
  socket.on("join-stream", (data) => {
    console.log("Viewer rejoint:", data);
    const { courseId, viewerId, viewerName } = data;

    // Vérifier si le stream est actif
    const streamData = activeStreams.get(courseId);
    if (!streamData) {
      socket.emit("no-active-stream");
      return;
    }

    // Rejoindre la salle du cours
    socket.join(courseId);

    // Ajouter le viewer à la liste
    streamData.viewers.set(socket.id, { viewerId, viewerName });

    // Informer l'instructeur qu'un nouveau viewer a rejoint
    io.to(streamData.instructorSocketId).emit("viewer-joined", {
      viewerId: socket.id,
      viewerName,
    });

    // Mettre à jour le nombre de viewers pour tous les participants
    io.to(courseId).emit("viewer-count-update", streamData.viewers.size);
  });

  // Signal WebRTC de l'instructeur vers un viewer
  socket.on("stream-signal", (data) => {
    console.log("Signal envoyé à:", data.viewerId);
    io.to(data.viewerId).emit("stream-signal", data.signal);
  });

  // Signal WebRTC de retour du viewer vers l'instructeur
  socket.on("return-signal", (data) => {
    console.log("Signal retourné pour le cours:", data.courseId);
    const streamData = activeStreams.get(data.courseId);
    if (streamData) {
      io.to(streamData.instructorSocketId).emit("receiving-returned-signal", {
        signal: data.signal,
        id: socket.id,
      });
    }
  });

  // Instructeur commence le partage d'écran
  socket.on("screen-sharing-started", (data) => {
    console.log("Partage d'écran démarré pour le cours:", data.courseId);
    io.to(data.courseId).emit("screen-sharing-started");
  });

  // Instructeur arrête le partage d'écran
  socket.on("screen-sharing-stopped", (data) => {
    console.log("Partage d'écran arrêté pour le cours:", data.courseId);
    io.to(data.courseId).emit("screen-sharing-stopped");
  });

  // Étudiant quitte le stream
  socket.on("leave-stream", (data) => {
    console.log("Viewer quitte volontairement:", data);
    if (data && data.courseId) {
      handleViewerDisconnect(io, socket.id, data.courseId, activeStreams);
    }
  });

  // Instructeur termine le stream
  socket.on("end-stream", (data) => {
    console.log("Stream terminé pour le cours:", data.courseId);
    const streamData = activeStreams.get(data.courseId);
    if (streamData) {
      // Informer tous les viewers que le stream est terminé
      io.to(data.courseId).emit("stream-ended");

      // Supprimer le stream actif
      activeStreams.delete(data.courseId);
    }
  });

  // Gérer la déconnexion
  socket.on("disconnect", (reason) => {
    console.log("Déconnexion:", socket.id, "Raison:", reason);
    let handled = false;

    // Vérifier si c'était un instructeur
    for (const [courseId, streamData] of activeStreams.entries()) {
      if (streamData.instructorSocketId === socket.id) {
        console.log("Instructeur déconnecté pour le cours:", courseId);

        // Informer tous les viewers que le stream est terminé
        io.to(courseId).emit("stream-ended");

        // Supprimer le stream actif
        activeStreams.delete(courseId);
        handled = true;
        break;
      }
    }

    // Si ce n'était pas un instructeur, vérifier tous les cours pour voir si c'était un viewer
    if (!handled) {
      for (const [courseId, streamData] of activeStreams.entries()) {
        if (streamData.viewers.has(socket.id)) {
          console.log("Viewer déconnecté du cours:", courseId);
          handleViewerDisconnect(io, socket.id, courseId, activeStreams);
          break;
        }
      }
    }
  });
}

module.exports = { handleStreamEvents };
