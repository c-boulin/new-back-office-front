import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { oidcClient } from "@/lib/oidcClient";
import { ShieldOff } from "lucide-react";

export function AccessDeniedPage() {
  const { t } = useTranslation("auth");
  const clear = useAuthStore((s) => s.clear);
  const onSignOut = async () => {
    clear();
    try {
      await oidcClient.signoutRedirect();
    } catch {
      window.location.href = "/login";
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-4 rounded-lg border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">{t("accessDenied.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("accessDenied.description")}</p>
        <Button onClick={() => void onSignOut()} variant="outline">
          {t("accessDenied.signOut")}
        </Button>
      </div>
    </div>
  );
}
