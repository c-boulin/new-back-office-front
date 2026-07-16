import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { AnalyticsQuery } from "../types";

export type AnalyticsRangePickerProps = {
  value: AnalyticsQuery["range"];
  onChange: (range: AnalyticsQuery["range"]) => void;
};

const RANGES: AnalyticsQuery["range"][] = ["7d", "30d", "90d"];

export function AnalyticsRangePicker({ value, onChange }: AnalyticsRangePickerProps) {
  const { t } = useTranslation("analytics");

  return (
    <div className="inline-flex gap-1 rounded-md border p-1" role="group" aria-label="Date range">
      {RANGES.map((range) => (
        <Button
          key={range}
          size="sm"
          variant={value === range ? "default" : "outline"}
          onClick={() => onChange(range)}
          className="border-0"
        >
          {t(`range.${range}`)}
        </Button>
      ))}
    </div>
  );
}
