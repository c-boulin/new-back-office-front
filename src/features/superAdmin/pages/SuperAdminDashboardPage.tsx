import { Activity, Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Cross-tenant activity, growth, and platform health."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active tenants" value="14" hint="Across regions" icon={Building2} />
        <StatCard label="Total users" value="1.2M" hint="Last 30 days" icon={Users} />
        <StatCard label="Uptime" value="99.98%" hint="Rolling 30 days" icon={Activity} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Platform-wide operational feed will appear here.
        </CardContent>
      </Card>
    </div>
  );
}
