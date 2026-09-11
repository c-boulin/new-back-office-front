import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { queryClient } from "@/lib/queryClient";
import { logoutRequest } from "@/features/auth/api";
import { resetTenantTheme } from "@/lib/tenantTheme";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const memberships = useAuthStore((s) => s.memberships);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const clearAuth = useAuthStore((s) => s.clear);
  const clearTenant = useTenantStore((s) => s.clear);
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  if (!user) return null;

  const activeMembership = memberships.find((m) => m.tenantId === activeTenantId);
  const roleKey = user.isSuperAdmin
    ? "roles.superAdmin"
    : activeMembership
      ? `roles.${activeMembership.role}`
      : null;

  const onLogout = async () => {
    await logoutRequest();
    queryClient.removeQueries();
    clearTenant();
    resetTenantTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="hidden flex-col sm:flex">
        <span className="truncate text-sm font-medium leading-tight">{user.name}</span>
        {roleKey ? (
          <span className="truncate text-xs leading-tight text-muted-foreground">
            {t(roleKey)}
          </span>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => void onLogout()}
        aria-label={t("menu.logout")}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
