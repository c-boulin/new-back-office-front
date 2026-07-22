import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { AppError } from "@/lib/httpClient";
import { env } from "@/lib/env";
import { passwordLogin, ssoInit } from "../api";
import { getSsoCallbackUrl } from "../ssoCallback";

const DEMO_EMAIL = "admin@weezchat.fr";
const DEMO_PASSWORD = "admin123";

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4">
      <rect x="1" y="1" width="8" height="8" fill="#f25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7fba00" />
      <rect x="1" y="11" width="8" height="8" fill="#00a4ef" />
      <rect x="11" y="11" width="8" height="8" fill="#ffb900" />
    </svg>
  );
}

export function MicrosoftSsoButton() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const [pending, setPending] = useState(false);

  const useMockPath = env.auth.mocked || env.mock.api;

  const runMock = async () => {
    const session = await passwordLogin({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      method: "sso",
    });
    setUser(session.user, session.memberships);
    queryClient.setQueryData(["auth", "me"], {
      user: session.user,
      memberships: session.memberships,
    });
    navigate("/", { replace: true });
  };

  const runReal = async () => {
    const url = await ssoInit(getSsoCallbackUrl());
    window.location.assign(url);
  };

  const onClick = async () => {
    setPending(true);
    markAuthenticating();
    try {
      if (useMockPath) {
        await runMock();
      } else {
        await runReal();
      }
    } catch (err) {
      const detail =
        err instanceof AppError && typeof err.message === "string" ? err.message : null;
      toast.error(detail ? `${t("errors.ssoInitFailed")} — ${detail}` : t("errors.ssoInitFailed"));
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => void onClick()}
      disabled={pending}
      className="h-11 w-full gap-3 rounded-full border-border bg-card font-medium text-foreground hover:bg-muted/60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t("login.ssoRedirecting")}
        </>
      ) : (
        <>
          <MicrosoftLogo />
          {t("login.microsoftLabel")}
        </>
      )}
    </Button>
  );
}
