import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/form-to-pdf/", // 👈 this must match your repo name
});
