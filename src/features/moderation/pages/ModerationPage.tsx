import { ShieldAlert } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function ModerationPage() {
  return (
    <PlaceholderPage
      title="Moderation queue"
      description="Review and act on reports, flagged profiles, and unsafe content."
      emptyTitle="No pending items"
      emptyDescription="New reports and flagged content will appear here in real time."
      icon={ShieldAlert}
    />
  );
}
