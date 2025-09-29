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
        // host: true,
        port: 5173,
        proxy: {
          // Proxy for Ollama API
          "/ollama": {
            target: "http://localhost:11434",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ollama/, ""),
          },
          // Proxy for Automatic1111 API (Stable Diffusion)
          "/sdapi": {
            target: "http://127.0.0.1:7860",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/sdapi/, ""),
          },
        },
      },
    };
  }

  // Production build (Netlify, Vercel, ...)
  return {
    plugins: [react(), tailwindcss()],
  };
});