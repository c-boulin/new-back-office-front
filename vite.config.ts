import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// @ts-expect-error - JS plugin, no types needed.
import { jsxTailGuard } from "./scripts/jsx-tail-guard.mjs";

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
