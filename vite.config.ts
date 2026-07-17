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
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
            "@tanstack/react-table",
          ],
          "radix-vendor": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "i18n-vendor": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
          "date-vendor": ["date-fns"],
          "sanitize-vendor": ["dompurify"],
          "auth-vendor": ["oidc-client-ts"],
        },
      },
    },
  },
});
