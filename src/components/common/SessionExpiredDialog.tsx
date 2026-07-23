import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { queryClient } from "@/lib/queryClient";
import { resetTenantTheme } from "@/lib/tenantTheme";
import { consumeSelectedProductId } from "@/features/auth/ssoCallback";

export function SessionExpiredDialog() {
  const status = useAuthStore((s) => s.status);
  const clear = useAuthStore((s) => s.clear);
  const clearTenant = useTenantStore((s) => s.clear);
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const open = status === "expired";

  const onReauth = () => {
    queryClient.removeQueries();
    clearTenant();
    resetTenantTheme();
    consumeSelectedProductId();
    clear();
    navigate("/login", { replace: true });
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("expired.title")}</DialogTitle>
          <DialogDescription>{t("expired.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onReauth}>{t("expired.signInAgain")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
