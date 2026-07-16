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
import { oidcClient } from "@/lib/oidcClient";

export function SessionExpiredDialog() {
  const status = useAuthStore((s) => s.status);
  const { t } = useTranslation("auth");
  const open = status === "expired";

  const onReauth = () => {
    void oidcClient.signinRedirect();
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
