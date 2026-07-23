import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useProductsStore } from "@/stores/productsStore";
import { AppError } from "@/lib/httpClient";
import { fetchProducts, ssoInit, ssoLogin } from "../api";
import { membershipToProduct } from "../products";
import { getSsoCallbackUrl } from "../ssoCallback";
import { openSsoPopup } from "../ssoPopup";

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
  const queryClient = useQueryClient();
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);
  const resetToIdle = useAuthStore((s) => s.resetToIdle);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const setProducts = useProductsStore((s) => s.setProducts);
  const [pending, setPending] = useState(false);

  const completeSsoLogin = async (sesameToken: string) => {
    const session = await ssoLogin(sesameToken);
    setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      method: "sso",
    });
    setUser(session.user, session.memberships);
    setProducts(session.memberships.map(membershipToProduct));
    queryClient.setQueryData(["auth", "me"], {
      user: session.user,
      memberships: session.memberships,
    });

    const catalog = await queryClient
      .fetchQuery({
        queryKey: ["auth", "products"],
        queryFn: fetchProducts,
        staleTime: 5 * 60_000,
      })
      .catch((err) => {
        console.warn(
          "[MicrosoftSsoButton] GET /v1/products failed — colors will fall back to derived values",
          err,
        );
        return [];
      });
    if (catalog.length > 0) setProducts(catalog);

    navigate("/", { replace: true });
  };

  const onClick = async () => {
    setPending(true);
    markAuthenticating();
    try {
      const url = await ssoInit(getSsoCallbackUrl());
      openSsoPopup(url, {
        onSuccess: (token) => {
          void completeSsoLogin(token)
            .catch((err) => {
              const detail =
                err instanceof AppError && typeof err.message === "string" ? err.message : null;
              toast.error(
                detail ? `${t("errors.generic")} — ${detail}` : t("errors.generic"),
              );
              resetToIdle();
            })
            .finally(() => setPending(false));
        },
        onError: (reason) => {
          if (reason === "popup_blocked") {
            toast.error(t("errors.ssoPopupBlocked"));
          } else {
            toast.error(t("errors.ssoRejected"));
          }
          resetToIdle();
          setPending(false);
        },
        onDismissed: () => {
          resetToIdle();
          setPending(false);
        },
      });
    } catch (err) {
      const detail =
        err instanceof AppError && typeof err.message === "string" ? err.message : null;
      toast.error(
        detail ? `${t("errors.ssoInitFailed")} — ${detail}` : t("errors.ssoInitFailed"),
      );
      resetToIdle();
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
