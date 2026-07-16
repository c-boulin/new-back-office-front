import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/common/FilterBar";

export type MatchesFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  active: "all" | "active" | "inactive";
  onActiveChange: (value: "all" | "active" | "inactive") => void;
  onReset: () => void;
  translations: {
    searchPlaceholder: string;
    statusLabel: string;
    all: string;
    active: string;
    inactive: string;
  };
};

const ACTIVE_OPTIONS: ("all" | "active" | "inactive")[] = [
  "all",
  "active",
  "inactive",
];

export function MatchesFilters({
  search,
  onSearchChange,
  active,
  onActiveChange,
  onReset,
  translations: t,
}: MatchesFiltersProps) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t.searchPlaceholder}
      onReset={onReset}
    >
      <Select
        value={active}
        onValueChange={(v) => onActiveChange(v as "all" | "active" | "inactive")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t.statusLabel} />
        </SelectTrigger>
        <SelectContent>
          {ACTIVE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option === "all"
                ? t.all
                : option === "active"
                  ? t.active
                  : t.inactive}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
