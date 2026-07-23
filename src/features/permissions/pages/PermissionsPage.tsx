import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingState } from "@/components/common/LoadingState";
import { RolesManager } from "@/features/permissions/components/RolesManager";

export function PermissionsPage() {
  return (
    <RouteBoundary loadingFallback={<LoadingState className="p-10" />}>
      <RolesManager />
    </RouteBoundary>
  );
}
