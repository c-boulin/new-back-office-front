import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PermissionPillMatrix } from "./PermissionPillMatrix";
import type { Role, RoleColor } from "@/features/permissions/types";

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

const ROLE_BADGE_OUTLINE: Record<RoleColor, string> = {
  error: "border-red-500 text-red-500",
  warning: "border-orange-400 text-orange-500",
  info: "border-blue-500 text-blue-600",
  success: "border-emerald-500 text-emerald-600",
  primary: "border-primary text-primary",
  secondary: "border-secondary-foreground text-secondary-foreground",
};

function countGranted(role: Role): number {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
    0,
  );
}

export type RoleDetailPanelProps = {
  role: Role | null;
  onToggle?: (section: string, action: string, value: boolean) => void;
};

export function RoleDetailPanel({ role, onToggle }: RoleDetailPanelProps) {
  const { t } = useTranslation("roles");

  if (!role) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <EmptyState title={t("noRoleSelected")} description={t("noRoleSelectedDesc")} />
      </div>
    );
  }

  const granted = countGranted(role);
  const total = Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.keys(actions).length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${AVATAR_BG[role.color]} ${AVATAR_TEXT[role.color]}`}
          >
            {role.label.slice(0, 2)}
          </span>
          <h2 className="text-2xl font-bold">{role.label}</h2>
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

      <PermissionPillMatrix
        value={role.permissions}
        onToggle={onToggle}
        readOnly={role.isLocked}
      />
    </div>
  );
}
