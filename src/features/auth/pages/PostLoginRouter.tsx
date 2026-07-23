import { useSuspenseQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingState } from "@/components/common/LoadingState";
import { useTenantStore } from "@/stores/tenantStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";
import { readSelectedProductId } from "@/features/auth/ssoCallback";
import type { TenantMembership } from "@/features/auth/types";

function pickTargetMembership(
  memberships: TenantMembership[],
  selectedProductId: number | null,
): TenantMembership | null {
  if (memberships.length === 0) return null;
  if (selectedProductId !== null) {
    const match = memberships.find((m) => m.tenantId === String(selectedProductId));
    if (match) return match;
  }
  return memberships[0];
}

function PostLoginResolver() {
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenantSlug = useTenantStore((s) => s.activeTenantSlug);

  const { data } = useSuspenseQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await fetchMe();
      setUser(me.user, me.memberships);
      return me;
    },
    staleTime: 60_000,
  });

  if (data.user.isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const selectedProductId = readSelectedProductId();
  const target = pickTargetMembership(data.memberships, selectedProductId);

  if (!target) {
    return <Navigate to="/access-denied" replace />;
  }

  if (activeTenantSlug !== target.tenantSlug) {
    setActiveTenant({ id: target.tenantId, slug: target.tenantSlug, theme: target.theme });
    applyBrandThemeForTenant(target.tenantId, target.tenantSlug);
  }

  return <Navigate to={`/t/${target.tenantSlug}`} replace />;
}

export function PostLoginRouter() {
  return (
    <RouteBoundary loadingFallback={<LoadingState className="p-10" />}>
      <PostLoginResolver />
    </RouteBoundary>
  );
}
