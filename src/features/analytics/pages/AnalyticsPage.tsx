import { ChartBar as BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Cohort retention, funnels, and geographic distribution."
      emptyTitle="No analytics yet"
      emptyDescription="Charts and cohort data will appear here as usage grows."
      icon={BarChart3}
    />
  );
}
