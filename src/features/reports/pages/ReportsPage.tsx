import { Flag } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Investigate signals raised by users and by automated safety systems."
      emptyTitle="No open reports"
      emptyDescription="You are all caught up. New reports will appear here."
      icon={Flag}
    />
  );
}
