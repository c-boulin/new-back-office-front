import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";
import { MatchesOverview } from "@/features/matches/components/MatchesOverview";

export function MatchesPage() {
  const { t } = useTranslation("matches");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <RouteBoundary loadingFallback={<LoadingCards count={4} />}>
        <MatchesOverview />
      </RouteBoundary>
    </div>
  );
}
