import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Building2, LayoutDashboard, Shield, Users } from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { SkipLink } from "@/components/common/SkipLink";

export function SuperAdminLayout() {
  const { t } = useTranslation("common");

  const items: SidebarNavItem[] = [
    { to: "/admin", icon: LayoutDashboard, label: t("nav.dashboard"), end: true },
    { to: "/admin/tenants", icon: Building2, label: t("nav.tenants") },
    { to: "/admin/admins", icon: Users, label: t("nav.superAdmin") },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SkipLink label={t("skipToContent")} targetId="main" />
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Shield className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Super admin</p>
            <p className="truncate text-xs text-muted-foreground">Platform control</p>
          </div>
        </div>
        <div className="flex-1 py-4">
          <SidebarNav items={items} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar mobileNav={<SidebarNav items={items} />} />
        <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <SessionExpiredDialog />
    </div>
  );
}
