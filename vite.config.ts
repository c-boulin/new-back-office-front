import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { jsxTailGuard } from "./scripts/jsx-tail-guard";

export default defineConfig({
  plugins: [jsxTailGuard(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
