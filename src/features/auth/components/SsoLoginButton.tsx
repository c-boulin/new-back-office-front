import { useTranslation } from "react-i18next";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { oidcClient } from "@/lib/oidcClient";
import { useAuthStore } from "@/stores/authStore";

export function SsoLoginButton() {
  const { t } = useTranslation("auth");
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);

  const onClick = () => {
    markAuthenticating();
    void oidcClient.signinRedirect();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      className="h-11 w-full border-slate-700 bg-slate-900/60 text-slate-100 hover:border-teal-400/50 hover:bg-slate-900 hover:text-white"
    >
      <KeyRound className="mr-2 h-4 w-4 text-teal-300" />
      {t("login.ssoButton")}
    </Button>
  );
}
