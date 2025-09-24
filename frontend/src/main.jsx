// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer/index";
import { Toaster } from "react-hot-toast";

// Créer le store Redux
export const store = configureStore({
  reducer: rootReducer,
});

// Initialiser le thème au démarrage
const savedDarkMode =
  localStorage.getItem("darkMode") === "false" ? false : true;
if (!savedDarkMode) {
  document.documentElement.classList.add("light-mode");
} else {
  document.documentElement.classList.remove("light-mode");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <React.StrictMode>
        <App />
        <Toaster />
      </React.StrictMode>
    </Provider>
  </BrowserRouter>
);
