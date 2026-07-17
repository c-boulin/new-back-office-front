import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { oidcClient } from "@/lib/oidcClient";
import { queryClient } from "@/lib/queryClient";
import { passwordLogout } from "@/features/auth/password/api";
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
  const method = useAuthStore((s) => s.method);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clear);
  const clearTenant = useTenantStore((s) => s.clear);
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  if (!user) return null;

  const onLogout = async () => {
    queryClient.removeQueries();
    clearTenant();
    resetTenantTheme();
    if (method === "password") {
      try {
        await passwordLogout(refreshToken);
      } catch {
        /* ignore mock/real logout errors */
      }
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
    clearAuth();
    try {
      await oidcClient.signoutRedirect();
    } catch {
      navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <UserIcon /> {t("menu.profile")}
        </DropdownMenuItem>
        {user.isSuperAdmin ? (
          <DropdownMenuItem onSelect={() => navigate("/admin")}>
            <ShieldCheck /> {t("menu.superAdmin")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void onLogout()}>
          <LogOut /> {t("menu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
