import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingState } from "@/components/common/LoadingState";
import { useTenantStore } from "@/stores/tenantStore";
import { useProductsStore } from "@/stores/productsStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";
import { membershipToProduct } from "@/features/auth/products";
import { PostLoginProductPicker } from "@/features/auth/components/PostLoginProductPicker";
import { useDefaultTheme } from "@/hooks/useDefaultTheme";
import type { TenantMembership } from "@/features/auth/types";

function ActivateTenant({ target }: { target: TenantMembership }) {
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenantSlug = useTenantStore((s) => s.activeTenantSlug);

  useEffect(() => {
    if (activeTenantSlug !== target.tenantSlug) {
      setActiveTenant({
        id: target.tenantId,
        slug: target.tenantSlug,
        theme: target.theme,
      });
      applyBrandThemeForTenant(target.tenantId, target.tenantSlug);
    }
  }, [activeTenantSlug, setActiveTenant, target]);

  return <Navigate to={`/t/${target.tenantSlug}`} replace />;
}

function PostLoginResolver() {
  useDefaultTheme();
  const setUser = useAuthStore((s) => s.setUser);
  const setProducts = useProductsStore((s) => s.setProducts);

  const { data } = useSuspenseQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await fetchMe();
      setUser(me.user, me.memberships);
      setProducts(me.memberships.map(membershipToProduct));
      return me;
    },
    staleTime: 60_000,
  });

  if (data.memberships.length === 0) {
    if (data.user.isSuperAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/access-denied" replace />;
  }

  if (data.memberships.length === 1) {
    return <ActivateTenant target={data.memberships[0]} />;
  }

  return <PostLoginProductPicker memberships={data.memberships} />;
}

export function PostLoginRouter() {
  return (
    <RouteBoundary loadingFallback={<LoadingState className="p-10" />}>
      <PostLoginResolver />
    </RouteBoundary>
  );
}
