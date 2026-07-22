import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";

export function ModerationPageHeader() {
  const { t } = useTranslation("moderation");
  return <PageHeader title={t("title")} description={t("description")} />;
}
