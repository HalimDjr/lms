// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Pour résoudre les problèmes avec simple-peer
      include: ["process", "buffer", "util", "stream"],
    }),
  ],
  define: {
    // Définir process.env pour éviter les erreurs
    "process.env": {},
  },
  resolve: {
    alias: {
      // Alias pour les modules Node.js
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
    },
  },
});
