import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/common/FilterBar";
import type { ReportStatus, ReportReason } from "../types";

export type ReportsFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: ReportStatus | "all";
  onStatusChange: (value: ReportStatus | "all") => void;
  reason: ReportReason | "all";
  onReasonChange: (value: ReportReason | "all") => void;
  onReset: () => void;
  translations: {
    searchPlaceholder: string;
    statusLabel: string;
    reasonLabel: string;
    allStatuses: string;
    allReasons: string;
    statuses: Record<ReportStatus, string>;
    reasons: Record<ReportReason, string>;
  };
};

const STATUSES: (ReportStatus | "all")[] = [
  "all",
  "open",
  "investigating",
  "resolved",
  "dismissed",
];

const REASONS: (ReportReason | "all")[] = [
  "all",
  "harassment",
  "spam",
  "fake_profile",
  "inappropriate_content",
  "underage",
  "scam",
  "other",
];

export function ReportsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  reason,
  onReasonChange,
  onReset,
  translations: t,
}: ReportsFiltersProps) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t.searchPlaceholder}
      onReset={onReset}
    >
      <Select value={status} onValueChange={(v) => onStatusChange(v as ReportStatus | "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t.statusLabel} />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "all" ? t.allStatuses : t.statuses[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={reason} onValueChange={(v) => onReasonChange(v as ReportReason | "all")}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t.reasonLabel} />
        </SelectTrigger>
        <SelectContent>
          {REASONS.map((r) => (
            <SelectItem key={r} value={r}>
              {r === "all" ? t.allReasons : t.reasons[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
