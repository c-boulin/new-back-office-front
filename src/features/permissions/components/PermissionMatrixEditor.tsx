import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionAction, PermissionMatrix, PermissionSection } from "@/lib/permissions";
import { PERMISSION_MATRIX } from "@/lib/permissions";
import { PERMISSION_GROUPS } from "../catalog";

export type PermissionMatrixEditorProps = {
  matrix: PermissionMatrix;
  disabled: boolean;
  onToggle: (section: PermissionSection, action: PermissionAction, next: boolean) => void;
};

function ActionButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-full items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "cursor-not-allowed opacity-60",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
      <span>{label}</span>
    </button>
  );
}

export function PermissionMatrixEditor({
  matrix,
  disabled,
  onToggle,
}: PermissionMatrixEditorProps) {
  const { t } = useTranslation("permissions");
  const allActions: PermissionAction[] = ["create", "read", "update", "delete"];

  return (
    <div className="space-y-8">
      {PERMISSION_GROUPS.map((group) => (
        <section key={group.key} className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t(`groups.${group.key}`)}
          </h3>
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="hidden grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,7rem))] items-center gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>{t("editor.title")}</span>
              {allActions.map((action) => (
                <span key={action} className="text-center">
                  {t(`actionsLabels.${action}`)}
                </span>
              ))}
            </div>
            <ul className="divide-y">
              {group.sections.map((section) => {
                const available = PERMISSION_MATRIX[section];
                const state = matrix[section] ?? {};
                return (
                  <li
                    key={section}
                    className="grid grid-cols-2 items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,7rem))]"
                  >
                    <span className="col-span-2 truncate text-sm font-medium sm:col-span-1">
                      {t(`sections.${section}`)}
                    </span>
                    {allActions.map((action) => {
                      const supported = available.includes(action);
                      if (!supported) {
                        return (
                          <div
                            key={action}
                            aria-hidden
                            className="hidden h-9 items-center justify-center rounded-md border border-dashed border-border/60 text-muted-foreground/50 sm:flex"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </div>
                        );
                      }
                      const active = Boolean(state[action]);
                      return (
                        <ActionButton
                          key={action}
                          active={active}
                          disabled={disabled}
                          label={t(`actionsLabels.${action}`)}
                          onClick={() => onToggle(section, action, !active)}
                        />
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
