import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeoEntry } from "../types";

export type GeoCardProps = {
  entries: GeoEntry[];
};

export function GeoCard({ entries }: GeoCardProps) {
  const { t } = useTranslation("analytics");

  // Take top 10 by user count (entries should already be sorted, but ensure)
  const top10 = [...entries]
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("geo.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top10.map((entry, i) => (
          <div key={entry.countryCode} className="flex items-center gap-3">
            {/* Rank */}
            <span className="w-5 text-right text-xs font-medium text-muted-foreground">
              {i + 1}
            </span>

            {/* Country code badge (no emoji per project rules) */}
            <span className="flex h-6 w-8 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
              {entry.countryCode}
            </span>

            {/* Country name + count */}
            <div className="flex flex-1 items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {entry.country}
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.userCount.toLocaleString()}
              </span>
            </div>

            {/* Percentage bar */}
            <div className="h-2 w-16 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
