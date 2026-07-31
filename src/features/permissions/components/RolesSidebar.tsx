import { useTranslation } from "react-i18next";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

function countPermissions(role: Role): number {
  return Object.values(role.permissions).reduce(
    (total, actions) => total + Object.values(actions).filter(Boolean).length,
    0,
  );
}

function totalPermissions(role: Role): number {
  return Object.values(role.permissions).reduce(
    (total, actions) => total + Object.keys(actions).length,
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
    <aside className="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm">
      <header className="flex items-center justify-between px-1 py-0.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
          const granted = countPermissions(role);
          const total = totalPermissions(role);
          const isSelected = role.id === selectedId;

          return (
            <li key={role.id}>
              <button
                type="button"
                onClick={() => onSelect(role)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  isSelected
                    ? "border border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-muted/60",
                )}
                aria-current={isSelected ? "true" : undefined}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase",
                    COLOR_BG[role.color],
                    COLOR_TEXT[role.color],
                  )}
                >
                  {role.label.slice(0, 2)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{role.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {granted}/{total} permissions
                  </p>
                </div>

                {role.isLocked ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1",
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
