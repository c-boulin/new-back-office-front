import { useTranslation } from "react-i18next";
import { FilterBar } from "@/components/common/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModerationItemType, ModerationStatus } from "../types";

const TYPES: (ModerationItemType | "all")[] = ["all", "photo", "bio", "message", "profile"];
const STATUSES: (ModerationStatus | "all")[] = ["all", "pending", "approved", "rejected", "escalated"];

export type ModerationFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  type: ModerationItemType | "all";
  onTypeChange: (value: ModerationItemType | "all") => void;
  status: ModerationStatus | "all";
  onStatusChange: (value: ModerationStatus | "all") => void;
  onReset: () => void;
};

export function ModerationFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  onReset,
}: ModerationFiltersProps) {
  const { t } = useTranslation("moderation");

  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t("filters.type")}
      onReset={onReset}
    >
      <Select value={type} onValueChange={(v) => onTypeChange(v as ModerationItemType | "all")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("filters.type")} />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((tp) => (
            <SelectItem key={tp} value={tp}>
              {tp === "all" ? t("filters.allTypes") : t(`types.${tp}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v as ModerationStatus | "all")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("filters.status")} />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((st) => (
            <SelectItem key={st} value={st}>
              {st === "all" ? t("filters.allStatuses") : t(`statuses.${st}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
