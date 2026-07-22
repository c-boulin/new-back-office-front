import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function CoachAiPage() {
  const { t } = useTranslation("common");
  return (
    <PlaceholderPage
      title={t("nav.coachAi")}
      description={t("placeholders.coachAi.description")}
      emptyTitle={t("placeholders.coachAi.emptyTitle")}
      emptyDescription={t("placeholders.coachAi.emptyDescription")}
      icon={Sparkles}
    />
  );
}
