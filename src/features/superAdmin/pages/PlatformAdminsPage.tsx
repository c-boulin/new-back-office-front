import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export function PlatformAdminsPage() {
  return (
    <PlaceholderPage
      title="Platform admins"
      description="Grant or revoke super-admin access across the platform."
      emptyTitle="No admins yet"
      emptyDescription="Invite platform administrators to manage tenants."
      icon={Users}
    />
  );
}
