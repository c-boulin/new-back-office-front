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

type NavGroup = { key: string; items: SidebarNavItem[] };

function buildGroups(base: string, t: (key: string) => string): NavGroup[] {
  const item = (
    slug: string,
    icon: LucideIcon,
    labelKey: string,
    end = false,
  ): SidebarNavItem => ({
    to: slug ? `${base}/${slug}` : base,
    icon,
    label: t(labelKey),
    end,
  });
  return [
    {
      key: "main",
      items: [
        item("", LayoutDashboard, "nav.dashboard", true),
        item("users", Users, "nav.users"),
      ],
    },
    {
      key: "animation",
      items: [
        item("animators", Mic, "nav.animators"),
        item("coaches", UserCog, "nav.coaches"),
        item("coach-ai", Sparkles, "nav.coachAi"),
      ],
    },
    {
      key: "analysis",
      items: [item("analytics", ChartBar, "nav.analytics")],
    },
    {
      key: "moderation",
      items: [
        item("moderation", ShieldAlert, "nav.moderation"),
        item("reports", Flag, "nav.reports"),
        item("messages", MessageSquareHeart, "nav.messages"),
      ],
    },
    {
      key: "configuration",
      items: [
        item("product-config", Settings2, "nav.productConfig"),
        item("permissions", ShieldCheck, "nav.permissions"),
      ],
    },
  ];
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

  const groups = useMemo(() => buildGroups(base, t), [base, t]);

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
