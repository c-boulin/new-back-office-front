import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { SettingsForm } from "@/features/settings/components/SettingsForm";

export function SettingsPage() {
  const { t } = useTranslation("settings");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <RouteBoundary>
        <SettingsForm />
      </RouteBoundary>
    </div>
  );
}
