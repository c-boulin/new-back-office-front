import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ssoLogin } from "../api";
import { consumeSelectedProductId, readSelectedProductId } from "../ssoCallback";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { ErrorState } from "@/components/common/ErrorState";

const SESAME_TOKEN_PATTERN = /^[A-Za-z0-9]{30,64}$/;

export function CallbackPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const status = params.get("status");
    const token = params.get("sesame_token");

    if (status === "ko") {
      setError(t("errors.ssoRejected"));
      return;
    }
    if (!token || !SESAME_TOKEN_PATTERN.test(token)) {
      setError(t("errors.ssoTokenInvalid"));
      return;
    }

    void (async () => {
      try {
        // Read (do not consume): PostLoginRouter will consume the id
        // to route straight to the selected product.
        const productId = readSelectedProductId() ?? env.defaultProductId;
        const session = await ssoLogin(token, productId);
        if (cancelled) return;
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
      } catch (err) {
        console.error("[CallbackPage] SSO login failed", err);
        // Failure — drop the stashed id so a manual retry from /login doesn't reuse it.
        consumeSelectedProductId();
        if (!cancelled) {
          setError(t("errors.generic"));
          toast.error(t("errors.generic"));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, params, setSession, setUser, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState title={error} onRetry={() => navigate("/login", { replace: true })} />
      </div>
    );
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
