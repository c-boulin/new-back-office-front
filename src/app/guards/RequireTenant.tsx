import { Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";
import type { TenantMembership } from "@/features/auth/types";

function synthSuperAdminMembership(tenantSlug: string): TenantMembership {
  return {
    tenantId: tenantSlug,
    tenantSlug,
    tenantName: tenantSlug,
    role: "admin",
    permissions: [],
    theme: null,
    lastAccessedAt: null,
  };
}

export function RequireTenant() {
  const { tenantSlug } = useParams();
  const memberships = useAuthStore((s) => s.memberships);
  const isSuperAdmin = useAuthStore((s) => Boolean(s.user?.isSuperAdmin));
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  const membership = useMemo(() => {
    if (!tenantSlug) return null;
    const known = memberships.find((m) => m.tenantSlug === tenantSlug);
    if (known) return known;
    if (isSuperAdmin) return synthSuperAdminMembership(tenantSlug);
    return null;
  }, [memberships, isSuperAdmin, tenantSlug]);

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
