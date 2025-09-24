// utils/fileSystem.js - Gestion des dossiers
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

function setupFolders() {
  const uploadDirs = [
    path.join(__dirname, "../public"),
    path.join(__dirname, "../public/uploads"),
    path.join(
      __dirname,
      "../public/uploads",
      process.env.FOLDER_NAME || "EPBLearning"
    ),
    path.join(
      __dirname,
      "../public/uploads",
      process.env.FOLDER_NAME || "EPBLearning",
      "resources"
    ),
    path.join(__dirname, "../public/uploads/instructor-applications"),
  ];

  uploadDirs.forEach((dir) => {
    fs.ensureDirSync(dir);
  });

  console.log("Dossiers d'upload créés avec succès");
}

module.exports = { setupFolders };
