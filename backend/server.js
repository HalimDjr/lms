const { app, server } = require("./config/express");
const { connectDB } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const { setupSocketIO } = require("./socket/socketManager");
const { setupFolders } = require("./utils/fileSystem");
require("dotenv").config();

// Configuration des dossiers d'upload
setupFolders();

// Configuration de Socket.IO
setupSocketIO(server);

// Démarrer le serveur de manière asynchrone
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await cloudinaryConnect();

    server.listen(PORT, () => {
      console.log(`Server Started on PORT ${PORT}`);
      console.log("Socket.IO server ready to accept connections");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
