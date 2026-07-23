import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { AppError } from "@/lib/httpClient";
import { ssoInit } from "../api";
import { getSsoCallbackUrl, saveSelectedProductId } from "../ssoCallback";

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

export type MicrosoftSsoButtonProps = {
  productId: number;
};

export function MicrosoftSsoButton({ productId }: MicrosoftSsoButtonProps) {
  const { t } = useTranslation("auth");
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    markAuthenticating();
    try {
      saveSelectedProductId(productId);
      const url = await ssoInit(getSsoCallbackUrl(), productId);
      window.location.assign(url);
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
