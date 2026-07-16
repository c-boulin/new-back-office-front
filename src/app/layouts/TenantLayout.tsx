import { Outlet, useParams } from "react-router-dom";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ChartBar as BarChart3, Flag, Heart, LayoutDashboard, MessagesSquare, Settings, ShieldAlert, Sparkles, Users } from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { useActiveTenant } from "@/hooks/useActiveTenant";

export function TenantLayout() {
  const { t } = useTranslation("common");
  const { tenantSlug } = useParams();
  const { membership } = useActiveTenant();

  const base = `/t/${tenantSlug}`;

  const items: SidebarNavItem[] = [
    { to: `${base}`, icon: LayoutDashboard, label: t("nav.dashboard"), end: true },
    { to: `${base}/users`, icon: Users, label: t("nav.users") },
    { to: `${base}/moderation`, icon: ShieldAlert, label: t("nav.moderation") },
    { to: `${base}/reports`, icon: Flag, label: t("nav.reports") },
    { to: `${base}/matches`, icon: Heart, label: t("nav.matches") },
    { to: `${base}/messages`, icon: MessagesSquare, label: t("nav.messages") },
    { to: `${base}/subscriptions`, icon: Sparkles, label: t("nav.subscriptions") },
    { to: `${base}/analytics`, icon: BarChart3, label: t("nav.analytics") },
    { to: `${base}/settings`, icon: Settings, label: t("nav.settings") },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{membership?.tenantName ?? "Tenant"}</p>
            <p className="truncate text-xs text-muted-foreground">/{tenantSlug}</p>
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
