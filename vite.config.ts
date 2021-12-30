import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
const path = require("path");

// https://vitejs.dev/config/
// export default defineConfig(({command, mode}) => {
// {
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   publicDir: "public/assets",
//   plugins: [react()],
// }

// });

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
      plugins: [react()],
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
      plugins: [react()],
    };
  }
});
