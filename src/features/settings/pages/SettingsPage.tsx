import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Tenant settings"
      description="Manage feature flags, branding, and moderation policy for this tenant."
      emptyTitle="Settings coming soon"
      emptyDescription="Tenant-scoped configuration will be available here."
      icon={Settings}
    />
  );
}
