import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/common/FilterBar";
import type { SubscriberStatus, PlanTier } from "../types";

export type SubscriptionsFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: SubscriberStatus | "all";
  onStatusChange: (value: SubscriberStatus | "all") => void;
  tier: PlanTier | "all";
  onTierChange: (value: PlanTier | "all") => void;
  onReset: () => void;
  translations: {
    searchPlaceholder: string;
    statusLabel: string;
    tierLabel: string;
    allStatuses: string;
    allTiers: string;
    statuses: Record<SubscriberStatus, string>;
    tiers: Record<PlanTier, string>;
  };
};

const STATUSES: (SubscriberStatus | "all")[] = ["all", "active", "cancelled", "expired", "trial"];
const TIERS: (PlanTier | "all")[] = ["all", "free", "basic", "premium", "vip"];

export function SubscriptionsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  tier,
  onTierChange,
  onReset,
  translations: t,
}: SubscriptionsFiltersProps) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t.searchPlaceholder}
      onReset={onReset}
    >
      <Select value={status} onValueChange={(v) => onStatusChange(v as SubscriberStatus | "all")}>
        <SelectTrigger className="w-[160px]">
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

      <Select value={tier} onValueChange={(v) => onTierChange(v as PlanTier | "all")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t.tierLabel} />
        </SelectTrigger>
        <SelectContent>
          {TIERS.map((tierOption) => (
            <SelectItem key={tierOption} value={tierOption}>
              {tierOption === "all" ? t.allTiers : t.tiers[tierOption]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
