import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "labs-src",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../labs",
    emptyOutDir: true
  }
});
