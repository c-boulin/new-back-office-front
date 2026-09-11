import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ModerationItemStatus } from "@/features/moderation/types";

export type StatusFilter = ModerationItemStatus | "all";

const STATUSES: StatusFilter[] = ["all", "pending", "approved", "rejected", "escalated"];

export function ModerationStatusFilters({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
}) {
  const { t } = useTranslation("moderation");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUSES.map((status) => {
        const active = value === status;
        const label = status === "all" ? t("filters.all") : t(`statuses.${status}`);
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
