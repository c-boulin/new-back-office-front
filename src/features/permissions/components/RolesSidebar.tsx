import { useTranslation } from "react-i18next";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const SELECTED_TINT: Record<RoleColor, string> = {
  error: "bg-red-500/20 border-l-2 border-red-500",
  warning: "bg-orange-500/20 border-l-2 border-orange-500",
  info: "bg-blue-500/20 border-l-2 border-blue-500",
  success: "bg-emerald-500/20 border-l-2 border-emerald-500",
  primary: "bg-primary/20 border-l-2 border-primary",
  secondary: "bg-muted/60 border-l-2 border-muted-foreground/60",
};

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
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAdd: () => void;
};

export function RolesSidebar({
  roles,
  selectedId,
  onSelect,
  onEdit,
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
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={onAdd}
          aria-label={t("actions.create")}
        >
          <Plus className="h-4 w-4" />
        </Button>
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
                  isSelected
                    ? SELECTED_TINT[role.color]
                    : "hover:bg-muted/50",
                )}
                aria-current={isSelected ? "true" : undefined}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase",
                    AVATAR_BG[role.color],
                    AVATAR_TEXT[role.color],
                  )}
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
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-0.5",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(role);
                      }}
                      aria-label={t("actions.edit")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(role);
                      }}
                      aria-label={t("actions.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
