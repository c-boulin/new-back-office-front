import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useTenantStore } from "@/stores/tenantStore";
import { applyTenantTheme } from "@/lib/tenantTheme";
import { env } from "@/lib/env";

export function PostLoginRouter() {
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenantSlug = useTenantStore((s) => s.activeTenantSlug);
  const cachedUser = useAuthStore((s) => s.user);
  const cachedMemberships = useAuthStore((s) => s.memberships);
  const method = useAuthStore((s) => s.method);
  const skipFetch = env.auth.mocked && method === "password" && cachedUser !== null;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await fetchMe();
      setUser(me.user, me.memberships);
      return me;
    },
    enabled: !skipFetch,
    staleTime: 60_000,
  });

  const resolved = skipFetch
    ? { user: cachedUser!, memberships: cachedMemberships }
    : data;

  if (!resolved) {
    if (isPending) return <LoadingState className="p-10" />;
    if (isError) return <ErrorState onRetry={() => void refetch()} />;
    return <LoadingState className="p-10" />;
  }

  if (resolved.user.isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (resolved.memberships.length === 0) {
    return <Navigate to="/access-denied" replace />;
  }

  if (resolved.memberships.length === 1) {
    const only = resolved.memberships[0];
    if (activeTenantSlug !== only.tenantSlug) {
      setActiveTenant({ id: only.tenantId, slug: only.tenantSlug, theme: only.theme });
      applyTenantTheme(only.theme);
    }
    return <Navigate to={`/t/${only.tenantSlug}`} replace />;
  }

  return <Navigate to="/tenants" replace />;
}
