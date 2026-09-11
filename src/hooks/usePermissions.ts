import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { hasPermission, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const memberships = useAuthStore((s) => s.memberships);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);

  const membership = memberships.find((m) => m.tenantId === activeTenantId);
  const scoped: string[] = user?.isSuperAdmin
    ? ["super_admin"]
    : (membership?.permissions ?? []);

  return {
    isSuperAdmin: Boolean(user?.isSuperAdmin),
    role: membership?.role,
    permissions: scoped,
    can: (required: Permission | Permission[]) => hasPermission(scoped, required),
  };
}
