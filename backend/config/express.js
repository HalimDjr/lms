// config/express.js - Configuration d'Express
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const routes = require("../routes");

const app = express();
const server = http.createServer(app);

// Configuration des middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "responseType"],
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Montage des routes
app.use("/api/v1", routes);

// Route par défaut
app.get("/", (req, res) => {
  res.send(`<div>
    This is Default Route  
    <p>Everything is OK</p>
    </div>`);
});

module.exports = { app, server };
