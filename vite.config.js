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
        proxy: {
          // tất cả request bắt đầu bằng /ollama sẽ được proxy sang localhost:11434
          "/ollama": {
            target: "http://localhost:11434",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ollama/, ""),
          },
        },
      },
    };
  }

  // production build (Netlify, Vercel, ...)
  return {
    plugins: [react(), tailwindcss()],
  };
});
