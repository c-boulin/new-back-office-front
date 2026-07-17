import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";
import { useActiveTenant } from "@/hooks/useActiveTenant";

export function TenantDashboardPage() {
  const { t } = useTranslation("dashboard");
  const { membership } = useActiveTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        title={membership?.tenantName ?? t("title")}
        description={t("description")}
      />
      <RouteBoundary loadingFallback={<LoadingCards count={4} />}>
        <DashboardContent />
      </RouteBoundary>
    </div>
  );
}
