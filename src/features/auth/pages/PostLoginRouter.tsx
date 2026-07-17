import { useSuspenseQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingState } from "@/components/common/LoadingState";
import { useTenantStore } from "@/stores/tenantStore";
import { applyTenantTheme } from "@/lib/tenantTheme";

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

  if (data.memberships.length === 0) {
    return <Navigate to="/access-denied" replace />;
  }

  if (data.memberships.length === 1) {
    const only = data.memberships[0];
    if (activeTenantSlug !== only.tenantSlug) {
      setActiveTenant({ id: only.tenantId, slug: only.tenantSlug, theme: only.theme });
      applyTenantTheme(only.theme);
    }
    return <Navigate to={`/t/${only.tenantSlug}`} replace />;
  }

  return <Navigate to="/tenants" replace />;
}

export function PostLoginRouter() {
  return (
    <RouteBoundary loadingFallback={<LoadingState className="p-10" />}>
      <PostLoginResolver />
    </RouteBoundary>
  );
}
