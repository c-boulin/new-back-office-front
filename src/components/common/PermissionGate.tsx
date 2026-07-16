import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";

export type PermissionGateProps = {
  require: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({ require, fallback = null, children }: PermissionGateProps) {
  const { can } = usePermissions();
  return can(require) ? <>{children}</> : <>{fallback}</>;
}
