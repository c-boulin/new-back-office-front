import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, UserCog, GraduationCap, Bot, ChartBar as BarChart2, Shield, Flag, Settings2, ShieldCheck, Lock, Plus, Eye, RefreshCw, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import type { Role, RoleColor } from "@/features/permissions/types";

// ─── Role avatar colors ───────────────────────────────────────────────────────

const AVATAR_BG: Record<RoleColor, string> = {
  error: "bg-red-500",
  warning: "bg-orange-400",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
};

const AVATAR_TEXT: Record<RoleColor, string> = {
  error: "text-white",
  warning: "text-white",
  info: "text-white",
  success: "text-white",
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
};

// Outline badge: border + text only, transparent background
const ROLE_BADGE_OUTLINE: Record<RoleColor, string> = {
  error: "border-red-500 text-red-500 dark:border-red-400 dark:text-red-400",
  warning: "border-orange-400 text-orange-500 dark:border-orange-400 dark:text-orange-400",
  info: "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
  success: "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400",
  primary: "border-primary text-primary",
  secondary: "border-secondary-foreground text-secondary-foreground",
};

// ─── Section groups ───────────────────────────────────────────────────────────

type SectionGroup = { key: string; sections: string[] };

const SECTION_GROUPS: SectionGroup[] = [
  { key: "principal", sections: ["dashboard", "users"] },
  { key: "animation", sections: ["animators", "coachs", "coach-ia"] },
  { key: "analyse", sections: ["statistics"] },
  { key: "moderation", sections: ["moderation", "signalement"] },
  { key: "configuration", sections: ["product-config", "settings"] },
];

const SECTION_ICON: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  animators: UserCog,
  coachs: GraduationCap,
  "coach-ia": Bot,
  statistics: BarChart2,
  moderation: Shield,
  signalement: Flag,
  "product-config": Settings2,
  settings: ShieldCheck,
};

// ─── Action styles (outline pills only) ──────────────────────────────────────

type ActionStyle = { pill: string; icon: string; legend: string };

const ACTION_STYLE: Record<string, ActionStyle> = {
  create: {
    pill: "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400",
    icon: "text-emerald-500 dark:text-emerald-400",
    legend: "text-emerald-600 dark:text-emerald-400",
  },
  read: {
    pill: "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
    legend: "text-blue-600 dark:text-blue-400",
  },
  update: {
    pill: "border-orange-400 text-orange-600 dark:border-orange-400 dark:text-orange-400",
    icon: "text-orange-500 dark:text-orange-400",
    legend: "text-orange-600 dark:text-orange-400",
  },
  delete: {
    pill: "border-red-400 text-red-500 dark:border-red-400 dark:text-red-400",
    icon: "text-red-500 dark:text-red-400",
    legend: "text-red-500 dark:text-red-400",
  },
};

const ACTION_ICON: Record<string, React.ElementType> = {
  create: Plus,
  read: Eye,
  update: RefreshCw,
  delete: Trash2,
};

const ACTIONS_ORDER = ["create", "read", "update", "delete"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countPermissions(role: Role) {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
    0,
  );
}

function totalPermissions(role: Role) {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.keys(actions).length,
    0,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionPill({ action, label }: { action: string; label: string }) {
  const style = ACTION_STYLE[action] ?? ACTION_STYLE.read;
  const Icon = ACTION_ICON[action] ?? Eye;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border bg-transparent px-2.5 py-0.5 text-xs font-medium ${style.pill}`}
    >
      <Icon className={`h-3 w-3 ${style.icon}`} aria-hidden />
      {label}
    </span>
  );
}

function LegendItem({ action, label }: { action: string; label: string }) {
  const style = ACTION_STYLE[action] ?? ACTION_STYLE.read;
  const Icon = ACTION_ICON[action] ?? Eye;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.legend}`}>
      <Icon className={`h-3.5 w-3.5 ${style.icon}`} aria-hidden />
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export type RoleDetailPanelProps = {
  role: Role | null;
};

export function RoleDetailPanel({ role }: RoleDetailPanelProps) {
  const { t } = useTranslation("roles");

  if (!role) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <EmptyState title={t("noRoleSelected")} description={t("noRoleSelectedDesc")} />
      </div>
    );
  }

  const granted = countPermissions(role);
  const total = totalPermissions(role);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${AVATAR_BG[role.color]} ${AVATAR_TEXT[role.color]}`}
          >
            {role.label.slice(0, 2)}
          </span>
          <h2 className="text-2xl font-bold">{role.label}</h2>
          {/* Outline badge with role color */}
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_OUTLINE[role.color]}`}
          >
            {role.label}
          </span>
          {role.isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              {t("nonModifiable")}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("permissionsGranted", { count: granted, total })}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5">
        {ACTIONS_ORDER.map((action) => (
          <LegendItem key={action} action={action} label={t(`actionLabels.${action}`)} />
        ))}
      </div>

      {/* Section groups */}
      <div className="flex flex-col gap-6">
        {SECTION_GROUPS.map((group) => {
          const visibleSections = group.sections.filter((section) => {
            const perms = role.permissions[section];
            return perms && Object.values(perms).some(Boolean);
          });
          if (visibleSections.length === 0) return null;

          return (
            <section key={group.key}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t(`sectionGroups.${group.key}`)}
              </p>
              <div className="rounded-xl border bg-card">
                {visibleSections.map((section, i) => {
                  const sectionPerms = role.permissions[section] ?? {};
                  const grantedActions = ACTIONS_ORDER.filter((a) => sectionPerms[a] === true);
                  const Icon = SECTION_ICON[section] ?? Settings2;

                  return (
                    <div
                      key={section}
                      className={`flex flex-wrap items-center gap-4 px-5 py-3.5 ${i < visibleSections.length - 1 ? "border-b" : ""}`}
                    >
                      <div className="flex w-44 shrink-0 items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="text-sm font-medium">{t(`sections.${section}`)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {grantedActions.map((action) => (
                          <ActionPill
                            key={action}
                            action={action}
                            label={t(`actionLabels.${action}`)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}