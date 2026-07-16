import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Activity, Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listTenants } from "@/features/tenants/api";

export function SuperAdminDashboardPage() {
  const { t } = useTranslation("superAdmin");

  const query = useQuery({
    queryKey: ["super-admin", "tenants"],
    queryFn: listTenants,
  });

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const tenants = query.data;
  const activeTenants = tenants.filter((t) => t.status === "active");
  const totalUsers = tenants.reduce((sum, t) => sum + t.usersCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active tenants"
          value={activeTenants.length}
          hint={`${tenants.length} total`}
          icon={Building2}
        />
        <StatCard
          label="Total users"
          value={totalUsers.toLocaleString()}
          hint="Across all tenants"
          icon={Users}
        />
        <StatCard
          label="Uptime"
          value="99.98%"
          hint="Rolling 30 days"
          icon={Activity}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{tenant.slug} - {tenant.usersCount.toLocaleString()} users
                  </p>
                </div>
                <Badge
                  variant={
                    tenant.status === "active"
                      ? "success"
                      : tenant.status === "suspended"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {tenant.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
