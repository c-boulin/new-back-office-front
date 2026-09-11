import { useTranslation } from "react-i18next";
import { Mic } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function AnimatorsPage() {
  const { t } = useTranslation("common");
  return (
    <PlaceholderPage
      title={t("nav.animators")}
      description={t("placeholders.animators.description")}
      emptyTitle={t("placeholders.animators.emptyTitle")}
      emptyDescription={t("placeholders.animators.emptyDescription")}
      icon={Mic}
    />
  );
}
