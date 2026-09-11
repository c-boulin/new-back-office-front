import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  Bot,
  ChartBar as BarChart2,
  Shield,
  Flag,
  Settings2,
  ShieldCheck,
  Plus,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { BACKOFFICE_SECTIONS } from "@/features/permissions/types";
import type { PermissionMatrix } from "@/features/permissions/types";

const SECTION_GROUPS = [
  { key: "principal", sections: ["dashboard", "users"] },
  { key: "animation", sections: ["animators", "coachs", "coach-ia"] },
  { key: "analyse", sections: ["statistics"] },
  { key: "moderation", sections: ["moderation", "signalement"] },
  { key: "configuration", sections: ["product-config", "settings"] },
] as const;

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

const ACTION_ACTIVE_CLASS: Record<string, string> = {
  create: "border-emerald-500 bg-emerald-50 text-emerald-700",
  read: "border-blue-500 bg-blue-50 text-blue-700",
  update: "border-orange-400 bg-orange-50 text-orange-700",
  delete: "border-red-400 bg-red-50 text-red-600",
};

const ACTION_ICON_CLASS: Record<string, string> = {
  create: "text-emerald-600",
  read: "text-blue-600",
  update: "text-orange-500",
  delete: "text-red-500",
};

const ACTIONS_ORDER = ["create", "read", "update", "delete"] as const;

export type PermissionPillMatrixProps = {
  value: PermissionMatrix;
  onToggle?: (section: string, action: string, value: boolean) => void;
  readOnly?: boolean;
};

export function PermissionPillMatrix({ value, onToggle, readOnly }: PermissionPillMatrixProps) {
  const { t } = useTranslation("roles");

  return (
    <div className="flex flex-col gap-6">
      {SECTION_GROUPS.map((group) => {
        const sections = group.sections as readonly string[];
        return (
          <section key={group.key}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t(`sectionGroups.${group.key}`)}
            </p>
            <div className="rounded-xl border bg-card">
              {sections.map((section, i) => {
                const catalogActions = (
                  BACKOFFICE_SECTIONS as Record<string, readonly string[]>
                )[section] ?? [];
                const sectionPerms = value[section] ?? {};
                const SectionIcon = SECTION_ICON[section] ?? Settings2;
                const availableActions = ACTIONS_ORDER.filter((a) =>
                  catalogActions.includes(a),
                );

                return (
                  <div
                    key={section}
                    className={`flex flex-wrap items-center gap-4 px-5 py-3.5 ${
                      i < sections.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex w-44 shrink-0 items-center gap-2.5">
                      <SectionIcon
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="text-sm font-medium">
                        {t(`sections.${section}`)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableActions.map((action) => {
                        const isActive = sectionPerms[action] === true;
                        const PillIcon = ACTION_ICON[action] ?? Eye;
                        const activeClass = ACTION_ACTIVE_CLASS[action] ?? "";
                        const iconClass = ACTION_ICON_CLASS[action] ?? "";

                        if (readOnly) {
                          if (!isActive) return null;
                          return (
                            <span
                              key={action}
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${activeClass}`}
                            >
                              <PillIcon
                                className={`h-3 w-3 ${iconClass}`}
                                aria-hidden
                              />
                              {t(`actionLabels.${action}`)}
                            </span>
                          );
                        }

                        return (
                          <button
                            key={action}
                            type="button"
                            onClick={() => onToggle?.(section, action, !isActive)}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              isActive
                                ? activeClass
                                : "border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground/70"
                            }`}
                            aria-pressed={isActive}
                            aria-label={`${t(`sections.${section}`)} — ${t(`actionLabels.${action}`)}`}
                          >
                            <PillIcon
                              className={`h-3 w-3 ${isActive ? iconClass : "text-muted-foreground/50"}`}
                              aria-hidden
                            />
                            {t(`actionLabels.${action}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
