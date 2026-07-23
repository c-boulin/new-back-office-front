import { useTranslation } from "react-i18next";
import { Lock, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PERMISSION_TOTAL } from "@/lib/permissions";
import { RoleColorSwatch } from "./roleColor";
import type { Role } from "../adaptors";

export type RolesListProps = {
  roles: Role[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  canCreate: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function RolesList({
  roles,
  selectedId,
  onSelect,
  onCreate,
  canCreate,
  search,
  onSearchChange,
}: RolesListProps) {
  const { t } = useTranslation("permissions");
  const filtered = roles.filter((r) =>
    r.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t("list.title")}
          </h2>
          {canCreate ? (
            <Button size="sm" onClick={onCreate} className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              {t("actions.newRole")}
            </Button>
          ) : null}
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label={t("list.searchPlaceholder")}
            placeholder={t("list.searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t("list.empty")}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((role) => {
              const isSelected = role.id === selectedId;
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(role.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isSelected
                        ? "border-primary/60 bg-primary/5 text-foreground shadow-sm"
                        : "border-transparent bg-card/40 hover:border-border hover:bg-muted/50",
                    )}
                  >
                    {role.color ? <RoleColorSwatch color={role.color} className="h-3 w-3" /> : null}
                    <span className="min-w-0 flex-1 truncate font-medium">{role.label}</span>
                    {role.isLocked ? (
                      <Lock
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-label={t("list.locked")}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                        isSelected
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                      aria-label={t("list.counterLabel", {
                        granted: role.grantedCount,
                        total: PERMISSION_TOTAL,
                      })}
                    >
                      {t("list.counter", {
                        granted: role.grantedCount,
                        total: PERMISSION_TOTAL,
                      })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
