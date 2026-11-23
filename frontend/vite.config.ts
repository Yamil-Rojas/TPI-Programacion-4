import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Debe coincidir con FRONTEND_ORIGIN del backend (CORS).
    // strictPort: si el 5173 está ocupado, avisa en vez de usar otro puerto.
    port: 5173,
    strictPort: true,
  },
});
