import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { oidcClient } from "@/lib/oidcClient";
import { useAuthStore } from "@/stores/authStore";

export function LoginPage() {
  const { t } = useTranslation("auth");
  const markAuthenticating = useAuthStore((s) => s.markAuthenticating);

  const onSignIn = () => {
    markAuthenticating();
    void oidcClient.signinRedirect();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("login.description")}</p>
      </div>

      <Button size="lg" className="w-full" onClick={onSignIn}>
        <LogIn />
        {t("login.ssoButton")}
      </Button>

      <p className="text-xs text-muted-foreground">{t("login.help")}</p>
    </div>
  );
}
