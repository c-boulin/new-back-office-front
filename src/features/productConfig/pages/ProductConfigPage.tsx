import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function ProductConfigPage() {
  const { t } = useTranslation("common");
  return (
    <PlaceholderPage
      title={t("nav.productConfig")}
      description={t("placeholders.productConfig.description")}
      emptyTitle={t("placeholders.productConfig.emptyTitle")}
      emptyDescription={t("placeholders.productConfig.emptyDescription")}
      icon={Settings2}
    />
  );
}
