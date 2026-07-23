import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import {
  hasPermission,
  PERMISSION_CATALOG,
  type Permission,
} from "@/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const memberships = useAuthStore((s) => s.memberships);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);

  const membership = memberships.find((m) => m.tenantId === activeTenantId);
  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  const permissions = useMemo(() => {
    if (isSuperAdmin) return [...PERMISSION_CATALOG];
    if (membership && membership.permissions.length > 0) return membership.permissions;
    return user?.permissions ?? [];
  }, [isSuperAdmin, membership, user?.permissions]);

  return {
    isSuperAdmin,
    role: membership?.role,
    roleName: user?.roleName ?? null,
    permissions,
    can: (required: Permission | Permission[]) => hasPermission(permissions, required),
  };
}
