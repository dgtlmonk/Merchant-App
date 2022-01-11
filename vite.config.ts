import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  return {
    root: "./",
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("react-router")) {
                return "vendor_react-router";
              }

              if (id.includes("@material-ui")) {
                return "vendor_mui";
              }

              if (id.includes("react-dom")) {
                return "vendor_react-dom";
              }

              return "vendor"; // all other package goes here
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        ["components"]: path.resolve(__dirname, "src/components"),
        ["views"]: path.resolve(__dirname, "src/views"),
        ["helpers"]: path.resolve(__dirname, "src/helpers"),
        ["types"]: path.resolve(__dirname, "src/types"),
        "~": resolve(__dirname, "src"),
      },
    },
    publicDir: command === "serve" ? "public/assets" : "public",
    plugins: [
      react(),
      VitePWA({
        includeAssets: [
          "favicon.svg",
          "favicon.ico",
          "robots.txt",
          "apple-touch-icon.png",
        ],
        manifest: {
          name: "Perkd Merchant App",
          short_name: "Perkd Merchant",
          description: "Perkd Merchant App",
          theme_color: "#ffffff",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
  };
});
