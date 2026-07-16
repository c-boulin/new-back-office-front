import { useTranslation } from "react-i18next";
import { FilterBar } from "@/components/common/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FlaggedFilter = "all" | "flagged" | "clean";

type MessagesFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  flagged: FlaggedFilter;
  onFlaggedChange: (value: FlaggedFilter) => void;
  onReset: () => void;
};

export function MessagesFilters({
  search,
  onSearchChange,
  flagged,
  onFlaggedChange,
  onReset,
}: MessagesFiltersProps) {
  const { t } = useTranslation("messages");

  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t("filters.search")}
      onReset={onReset}
    >
      <Select value={flagged} onValueChange={(v) => onFlaggedChange(v as FlaggedFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("filters.flagged")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all")}</SelectItem>
          <SelectItem value="flagged">{t("filters.flaggedOnly")}</SelectItem>
          <SelectItem value="clean">{t("filters.cleanOnly")}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
