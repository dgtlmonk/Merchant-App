import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
const path = require("path");

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    return {
      // dev specific config

      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      publicDir: "public/assets",
      plugins: [react(), VitePWA({})],
    };
  } else {
    // command === 'build'
    return {
      // build specific config

      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      publicDir: "public",
      plugins: [react(), VitePWA({})],
    };
  }
});
