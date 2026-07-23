import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { queryClient } from "@/lib/queryClient";
import { resetTenantTheme } from "@/lib/tenantTheme";
import { logoutRequest } from "@/features/auth/api";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SidebarUserCard() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const clearTenant = useTenantStore((s) => s.clear);
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  if (!user) return null;

  const onLogout = async () => {
    await logoutRequest();
    queryClient.removeQueries();
    clearTenant();
    resetTenantTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const roleLabel = user.isSuperAdmin ? t("roles.superAdmin") : t("roles.admin");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{roleLabel}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void onLogout()}
        aria-label={t("menu.logout")}
        className="h-8 w-8"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
