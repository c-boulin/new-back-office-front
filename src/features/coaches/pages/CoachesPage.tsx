import { useTranslation } from "react-i18next";
import { UserCog } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function CoachesPage() {
  const { t } = useTranslation("common");
  return (
    <PlaceholderPage
      title={t("nav.coaches")}
      description={t("placeholders.coaches.description")}
      emptyTitle={t("placeholders.coaches.emptyTitle")}
      emptyDescription={t("placeholders.coaches.emptyDescription")}
      icon={UserCog}
    />
  );
}
