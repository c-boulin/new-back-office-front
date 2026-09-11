import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";

export function useActiveTenant() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const activeTenantSlug = useTenantStore((s) => s.activeTenantSlug);
  const memberships = useAuthStore((s) => s.memberships);
  const membership = memberships.find((m) => m.tenantId === activeTenantId);
  return {
    id: activeTenantId,
    slug: activeTenantSlug,
    membership,
  };
}
