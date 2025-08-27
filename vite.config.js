import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [react(), tailwindcss()],
      server: {
        https: {
          key: fs.readFileSync("./localhost+2-key.pem"),
          cert: fs.readFileSync("./localhost+2.pem"),
        },
        host: "localhost",
        port: 5173,
      },
    };
  }

  // production build (Netlify, Vercel, ...)
  return {
    plugins: [react(), tailwindcss()],
  };
});
