import { useTranslation } from "react-i18next";
import { Activity, Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuperAdminDashboardPage() {
  const { t } = useTranslation("superAdmin");
  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("dashboard.stats.tenants")}
          value="14"
          hint={t("dashboard.stats.tenants_hint")}
          icon={Building2}
        />
        <StatCard
          label={t("dashboard.stats.users")}
          value="1.2M"
          hint={t("dashboard.stats.users_hint")}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.stats.uptime")}
          value="99.98%"
          hint={t("dashboard.stats.uptime_hint")}
          icon={Activity}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.sections.activity")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("dashboard.sections.activity_empty")}
        </CardContent>
      </Card>
    </div>
  );
}
