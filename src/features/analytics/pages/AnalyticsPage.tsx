import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";
import { AnalyticsOverview } from "@/features/analytics/components/AnalyticsOverview";

export function AnalyticsPage() {
  const { t } = useTranslation("analytics");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <RouteBoundary loadingFallback={<LoadingCards count={3} />}>
        <AnalyticsOverview />
      </RouteBoundary>
    </div>
  );
}
