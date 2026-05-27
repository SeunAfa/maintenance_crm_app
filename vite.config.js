import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app under https://<user>.github.io/<repo>/,
  // so every asset URL needs the repo name as a prefix in production.
  base: "/maintenance_crm_app/",
  plugins: [react(), tailwindcss()],
});
