import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyCount } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

type Props = { series: DailyCount[]; className?: string };

export function EngagementChart({ series, className }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const max = useMemo(() => Math.max(1, ...series.map((p) => p.count)), [series]);

  if (series.length === 0) return null;

  const numberFormat = new Intl.NumberFormat(i18n.language);

  return (
    <Card className={cn("self-start", className)}>
      <CardHeader>
        <CardTitle>{t("sections.engagementOverTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex h-64 items-end gap-1" aria-label={t("sections.engagementOverTime")}>
          {series.map((point) => {
            const label = `${point.date}: ${numberFormat.format(point.count)}`;
            return (
              <li
                key={point.date}
                className="h-[var(--bar)] flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/70 transition-colors hover:from-primary/60 hover:to-primary"
                style={{ "--bar": `${Math.max(4, (point.count / max) * 100)}%` } as CSSProperties}
                title={label}
              >
                <span className="sr-only">{label}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
