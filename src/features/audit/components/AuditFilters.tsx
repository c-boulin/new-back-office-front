import { useTranslation } from "react-i18next";
import { FilterBar } from "@/components/common/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditAction } from "@/features/audit/types";

const ACTION_OPTIONS: (AuditAction | "all")[] = [
  "all",
  "user.ban",
  "user.unban",
  "user.verify",
  "moderation.approve",
  "moderation.reject",
  "moderation.escalate",
  "report.resolve",
  "report.dismiss",
  "report.investigate",
  "subscription.refund",
  "subscription.cancel",
  "settings.update",
  "flag.toggle",
  "tenant.create",
  "tenant.update",
  "admin.invite",
  "admin.remove",
];

function formatAction(action: string): string {
  const formatted = action.replace(/\./g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type AuditFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  action: AuditAction | "all";
  onActionChange: (value: AuditAction | "all") => void;
  onReset: () => void;
};

export function AuditFilters({
  search,
  onSearchChange,
  action,
  onActionChange,
  onReset,
}: AuditFiltersProps) {
  const { t } = useTranslation("audit");

  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t("filters.search")}
      onReset={onReset}
    >
      <Select
        value={action}
        onValueChange={(v) => onActionChange(v as AuditAction | "all")}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("filters.action")} />
        </SelectTrigger>
        <SelectContent>
          {ACTION_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt === "all" ? t("filters.allActions") : formatAction(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
