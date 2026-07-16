import { useTranslation } from "react-i18next";
import { Activity, Flag, Heart, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveTenant } from "@/hooks/useActiveTenant";

export function TenantDashboardPage() {
  const { t } = useTranslation("common");
  const { membership } = useActiveTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        title={membership?.tenantName ?? t("nav.dashboard")}
        description="Real-time overview of activity, growth, and safety on this tenant."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active users"
          value="12,486"
          hint="Last 7 days"
          trend={{ direction: "up", label: "+8.2% vs previous" }}
          icon={Users}
        />
        <StatCard
          label="New matches"
          value="3,281"
          hint="Last 24 hours"
          trend={{ direction: "up", label: "+3.4% vs previous" }}
          icon={Heart}
        />
        <StatCard
          label="Reports open"
          value="24"
          hint="Requires attention"
          trend={{ direction: "flat", label: "No change" }}
          icon={Flag}
        />
        <StatCard
          label="Sessions"
          value="41,208"
          hint="Rolling 24h"
          trend={{ direction: "down", label: "-1.1% vs previous" }}
          icon={Activity}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Engagement over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-64 rounded-md bg-gradient-to-tr from-primary/5 via-primary/10 to-accent/10"
              aria-hidden
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
