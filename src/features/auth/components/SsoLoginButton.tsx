import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { AppError } from "@/lib/httpClient";
import { ssoInit } from "../api";
import { getSsoCallbackUrl } from "../ssoCallback";

function describeApiError(err: unknown): string | null {
  if (!(err instanceof AppError)) return null;
  const body = err.details as
    | { message?: unknown; errors?: Record<string, unknown> }
    | undefined;
  if (body && typeof body === "object") {
    if (body.errors && typeof body.errors === "object") {
      const flat = Object.entries(body.errors)
        .map(([field, msgs]) => {
          const list = Array.isArray(msgs) ? msgs : [msgs];
          return `${field}: ${list.join(", ")}`;
        })
        .join(" — ");
      if (flat) return flat;
    }
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  }
  return err.message || null;
}

export function SsoLoginButton() {
  const { t } = useTranslation("auth");
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    markAuthenticating();
    try {
      const url = await ssoInit(getSsoCallbackUrl());
      window.location.assign(url);
    } catch (err) {
      if (err instanceof AppError) {
        console.error("[sso-init] backend rejected the request", {
          status: err.status,
          code: err.code,
          requestId: err.requestId,
          body: err.details,
        });
      } else {
        console.error("[sso-init] unexpected failure", err);
      }
      const detail = describeApiError(err);
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
      className="h-11 w-full border-slate-700 bg-slate-900/60 text-slate-100 hover:border-teal-400/50 hover:bg-slate-900 hover:text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("login.ssoRedirecting")}
        </>
      ) : (
        <>
          <KeyRound className="mr-2 h-4 w-4 text-teal-300" />
          {t("login.ssoButton")}
        </>
      )}
    </Button>
  );
}
