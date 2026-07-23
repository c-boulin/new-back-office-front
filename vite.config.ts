import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// @ts-expect-error - JS plugin, no types needed.
import { jsxTailGuard } from "./scripts/jsx-tail-guard.mjs";

// Static hosting on S3/CloudFront serves this bundle under a subpath prefix.
// Local `vite` dev still runs at the root, so base is command-dependent.
const DEPLOY_BASE = "/pocs/bolt-dating-front-back-office/";

function resolveBase(command: "serve" | "build", envOverride: string | undefined): string {
  const override = envOverride ?? process.env.VITE_BASE_PATH;
  if (override && override.startsWith("/") && override.endsWith("/")) {
    return override;
  }
  return command === "build" ? DEPLOY_BASE : "/";
}

export default defineConfig(({ command, mode }) => ({
  base: resolveBase(command, loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_PATH),
  plugins: [jsxTailGuard(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": [
            "@tanstack/react-query",
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
        },
      },
    },
  },
}));
