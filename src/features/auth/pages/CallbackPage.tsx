import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader as Loader2 } from "lucide-react";
import { oidcClient } from "@/lib/oidcClient";
import { useAuthStore } from "@/stores/authStore";
import { ErrorState } from "@/components/common/ErrorState";

export function CallbackPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const user = await oidcClient.signinRedirectCallback();
        if (cancelled) return;
        setSession({
          accessToken: user.access_token,
          idToken: user.id_token ?? null,
          expiresAt: user.expires_at ?? null,
        });
        navigate("/", { replace: true });
      } catch (err) {
        console.error("[CallbackPage] signin failed", err);
        if (!cancelled) setError(t("callback.error"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, setSession, t]);

  if (error) {
    return <ErrorState title={error} onRetry={() => navigate("/login", { replace: true })} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        {t("callback.loading")}
      </div>
    </div>
  );
}
