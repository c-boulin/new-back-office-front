import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function PermissionsPage() {
  const { t } = useTranslation("common");
  return (
    <PlaceholderPage
      title={t("nav.permissions")}
      description={t("placeholders.permissions.description")}
      emptyTitle={t("placeholders.permissions.emptyTitle")}
      emptyDescription={t("placeholders.permissions.emptyDescription")}
      icon={ShieldCheck}
    />
  );
}
