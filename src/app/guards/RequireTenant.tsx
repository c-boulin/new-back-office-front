import { Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";

export function RequireTenant() {
  const { tenantSlug } = useParams();
  const memberships = useAuthStore((s) => s.memberships);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  const membership = memberships.find((m) => m.tenantSlug === tenantSlug);

  useEffect(() => {
    if (membership && membership.tenantId !== activeTenantId) {
      setActiveTenant({
        id: membership.tenantId,
        slug: membership.tenantSlug,
        theme: membership.theme,
      });
      applyBrandThemeForTenant(membership.tenantId, membership.tenantSlug);
    }
  }, [membership, activeTenantId, setActiveTenant]);

  if (!tenantSlug) return <Navigate to="/" replace />;
  if (!membership) return <Navigate to="/" replace />;

  return <Outlet />;
}
