import { Outlet, useParams } from "react-router-dom";
import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ChartBar,
  Flag,
  LayoutDashboard,
  MessageSquareHeart,
  Mic,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { SidebarSection } from "./SidebarSection";
import { SidebarUserCard } from "./SidebarUserCard";
import { SidebarProductCard } from "./SidebarProductCard";
import { TopBar } from "./TopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { SkipLink } from "@/components/common/SkipLink";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";

type GuardedNavItem = SidebarNavItem & { permission?: Permission };
type NavGroup = { key: string; items: GuardedNavItem[] };

function buildGroups(base: string, t: (key: string) => string): NavGroup[] {
  const item = (
    slug: string,
    icon: LucideIcon,
    labelKey: string,
    permission?: Permission,
    end = false,
  ): GuardedNavItem => ({
    to: slug ? `${base}/${slug}` : base,
    icon,
    label: t(labelKey),
    end,
    permission,
  });
  return [
    {
      key: "main",
      items: [
        item("", LayoutDashboard, "nav.dashboard", PERMISSIONS.DASHBOARD_READ, true),
        item("users", Users, "nav.users", PERMISSIONS.USERS_READ),
      ],
    },
    {
      key: "animation",
      items: [
        item("animators", Mic, "nav.animators", PERMISSIONS.ANIMATORS_READ),
        item("coaches", UserCog, "nav.coaches", PERMISSIONS.COACHS_READ),
        item("coach-ai", Sparkles, "nav.coachAi", PERMISSIONS.COACH_IA_READ),
      ],
    },
    {
      key: "analysis",
      items: [item("analytics", ChartBar, "nav.analytics", PERMISSIONS.STATISTICS_READ)],
    },
    {
      key: "moderation",
      items: [
        item("moderation", ShieldAlert, "nav.moderation", PERMISSIONS.MODERATION_READ),
        item("reports", Flag, "nav.reports", PERMISSIONS.SIGNALEMENT_READ),
        item("messages", MessageSquareHeart, "nav.messages"),
      ],
    },
    {
      key: "configuration",
      items: [
        item("product-config", Settings2, "nav.productConfig", PERMISSIONS.PRODUCT_CONFIG_READ),
        item("permissions", ShieldCheck, "nav.permissions", PERMISSIONS.SETTINGS_READ),
      ],
    },
  ];
}

function filterGroups(groups: NavGroup[], can: (p: Permission) => boolean): NavGroup[] {
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.permission || can(i.permission)),
    }))
    .filter((g) => g.items.length > 0);
}

function GroupedSidebarNav({ groups, t }: { groups: NavGroup[]; t: (key: string) => string }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <SidebarSection key={group.key} label={t(`nav.groups.${group.key}`)}>
          <SidebarNav items={group.items} />
        </SidebarSection>
      ))}
    </div>
  );
}

export function TenantLayout() {
  const { t } = useTranslation("common");
  const { tenantSlug } = useParams();
  const base = `/t/${tenantSlug}`;
  const { can } = usePermissions();

  const groups = useMemo(
    () => filterGroups(buildGroups(base, t), can),
    [base, t, can],
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SkipLink label={t("skipToContent")} targetId="main" />

      <aside className="hidden w-72 shrink-0 border-r bg-card/60 backdrop-blur md:flex md:flex-col">
        <div className="p-4">
          <SidebarProductCard />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <GroupedSidebarNav groups={groups} t={t} />
        </div>
        <div className="border-t p-3">
          <SidebarUserCard />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          mobileNav={
            <div className="flex h-full flex-col">
              <div className="p-4">
                <SidebarProductCard />
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-4">
                <GroupedSidebarNav groups={groups} t={t} />
              </div>
              <div className="border-t p-3">
                <SidebarUserCard />
              </div>
            </div>
          }
        />
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
