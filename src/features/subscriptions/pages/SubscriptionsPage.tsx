import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";
import { SubscriptionsOverview } from "@/features/subscriptions/components/SubscriptionsOverview";

export function SubscriptionsPage() {
  const { t } = useTranslation("subscriptions");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <RouteBoundary loadingFallback={<LoadingCards count={4} />}>
        <SubscriptionsOverview />
      </RouteBoundary>
    </div>
  );
}
