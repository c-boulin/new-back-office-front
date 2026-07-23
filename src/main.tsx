import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { AppProviders } from "@/app/providers/AppProviders";
import { handleSsoPopupBootIfNeeded } from "@/features/auth/ssoPopup";
import "@/lib/i18n";
import "./index.css";

if (handleSsoPopupBootIfNeeded()) {
  document.body.innerHTML =
    '<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;color:#475569;padding:24px;text-align:center">Vous pouvez fermer cette fen&ecirc;tre.</div>';
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
}
