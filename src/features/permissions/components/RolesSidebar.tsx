import { useTranslation } from "react-i18next";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Role } from "@/features/permissions/types";

function contrastText(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

const TOTAL_ACTIONS = Object.values(
  {
    dashboard: ["read"],
    users: ["read", "update", "delete"],
    animators: ["create", "read", "update", "delete"],
    coachs: ["create", "read", "update", "delete"],
    "coach-ia": ["read", "update"],
    statistics: ["read"],
    moderation: ["read", "update"],
    signalement: ["read", "update"],
    "product-config": ["create", "read", "update", "delete"],
    settings: ["create", "read", "update", "delete"],
  } as const,
).reduce((sum, actions) => sum + actions.length, 0);

function countGranted(role: Role): number {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
    0,
  );
}

export type RolesSidebarProps = {
  roles: Role[];
  selectedId: string | null;
  onSelect: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAdd: () => void;
};

export function RolesSidebar({
  roles,
  selectedId,
  onSelect,
  onDelete,
  onAdd,
}: RolesSidebarProps) {
  const { t } = useTranslation("roles");

  return (
    <aside className="flex flex-col border-r pr-5">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("rolesCount", { count: roles.length })}
        </span>
        <PermissionGate require={PERMISSIONS.SETTINGS_CREATE}>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onAdd}
            aria-label={t("actions.create")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </PermissionGate>
      </header>

      <ul className="flex flex-col gap-1">
        {roles.map((role) => {
          const granted = countGranted(role);
          const isSelected = role.id === selectedId;

          return (
            <li key={role.id}>
              <button
                type="button"
                onClick={() => onSelect(role)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  isSelected ? "border-l-2" : "hover:bg-muted/50",
                )}
                style={isSelected ? {
                  borderLeftColor: role.color,
                  backgroundColor: `${role.color}20`,
                } : undefined}
                aria-current={isSelected ? "true" : undefined}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: role.color, color: contrastText(role.color) }}
                >
                  {role.label.slice(0, 2)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-semibold", isSelected && "text-foreground")}>{role.label}</p>
                  <p className={cn("text-xs", isSelected ? "text-foreground/70" : "text-muted-foreground")}>
                    {t("permissionsGranted", { count: granted, total: TOTAL_ACTIONS })}
                  </p>
                </div>

                {role.isLocked ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(role);
                    }}
                    aria-label={t("actions.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
