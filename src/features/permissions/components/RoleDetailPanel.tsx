import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, UserCog, GraduationCap, Bot, ChartBar as BarChart2, Shield, Flag, Settings2, ShieldCheck, Lock, Plus, Eye, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import type { Role, RoleColor } from "@/features/permissions/types";

const COLOR_BG: Record<RoleColor, string> = {
  error: "bg-red-500",
  warning: "bg-orange-400",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
};

const COLOR_TEXT: Record<RoleColor, string> = {
  error: "text-white",
  warning: "text-white",
  info: "text-white",
  success: "text-white",
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
};

const COLOR_BADGE_VARIANT: Record<
  RoleColor,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  error: "destructive",
  warning: "warning",
  info: "secondary",
  success: "success",
  primary: "default",
  secondary: "secondary",
};

type SectionGroup = {
  key: string;
  sections: string[];
};

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

const ACTION_ICON: Record<string, React.ElementType> = {
  create: Plus,
  read: Eye,
  update: RefreshCw,
  delete: Trash2,
};

const ACTION_COLOR: Record<
  string,
  { border: string; bg: string; text: string; icon: string }
> = {
  create: {
    border: "border-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "text-emerald-500",
  },
  read: {
    border: "border-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-500",
  },
  update: {
    border: "border-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: "text-orange-500",
  },
  delete: {
    border: "border-red-300",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-500",
  },
};

const ACTIONS_ORDER = ["create", "read", "update", "delete"] as const;

function countPermissions(role: Role) {
  return Object.values(role.permissions).reduce(
    (total, actions) => total + Object.values(actions).filter(Boolean).length,
    0,
  );
}

function totalPermissions(role: Role) {
  return Object.values(role.permissions).reduce(
    (total, actions) => total + Object.keys(actions).length,
    0,
  );
}

type ActionPillProps = {
  action: string;
  label: string;
};

function ActionPill({ action, label }: ActionPillProps) {
  const style = ACTION_COLOR[action] ?? ACTION_COLOR.read;
  const Icon = ACTION_ICON[action] ?? Eye;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.border} ${style.bg} ${style.text}`}
    >
      <Icon className={`h-3 w-3 ${style.icon}`} aria-hidden />
      {label}
    </span>
  );
}

type LegendItemProps = {
  action: string;
  label: string;
};

function LegendItem({ action, label }: LegendItemProps) {
  const style = ACTION_COLOR[action] ?? ACTION_COLOR.read;
  const Icon = ACTION_ICON[action] ?? Eye;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${style.text}`}>
      <Icon className={`h-3.5 w-3.5 ${style.icon}`} aria-hidden />
      {label}
    </span>
  );
}

export type RoleDetailPanelProps = {
  role: Role | null;
};

export function RoleDetailPanel({ role }: RoleDetailPanelProps) {
  const { t } = useTranslation("roles");

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 shadow-sm">
        <EmptyState title={t("noRoleSelected")} description={t("noRoleSelectedDesc")} />
      </div>
    );
  }

  const granted = countPermissions(role);
  const total = totalPermissions(role);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase ${COLOR_BG[role.color]} ${COLOR_TEXT[role.color]}`}
          >
            {role.label.slice(0, 2)}
          </span>
          <h2 className="text-xl font-bold">{role.label}</h2>
          <Badge variant={COLOR_BADGE_VARIANT[role.color]}>{role.label}</Badge>
          {role.isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-muted bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              {t("nonModifiable")}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("permissionsGranted", { count: granted, total })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b pb-4">
        {ACTIONS_ORDER.map((action) => (
          <LegendItem key={action} action={action} label={t(`actionLabels.${action}`)} />
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {SECTION_GROUPS.map((group) => {
          const rowsWithGrants = group.sections.filter((section) => {
            const sectionPerms = role.permissions[section];
            return sectionPerms && Object.values(sectionPerms).some(Boolean);
          });
          if (rowsWithGrants.length === 0) return null;

          return (
            <section key={group.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t(`sectionGroups.${group.key}`)}
              </p>
              <div className="rounded-2xl border bg-background">
                {rowsWithGrants.map((section, i) => {
                  const sectionPerms = role.permissions[section] ?? {};
                  const grantedActions = ACTIONS_ORDER.filter(
                    (a) => sectionPerms[a] === true,
                  );
                  const Icon = SECTION_ICON[section] ?? Settings2;

                  return (
                    <div
                      key={section}
                      className={`flex flex-wrap items-center gap-3 px-5 py-4 ${i < rowsWithGrants.length - 1 ? "border-b" : ""}`}
                    >
                      <div className="flex w-48 shrink-0 items-center gap-2">
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
