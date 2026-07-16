import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CohortRow } from "../types";

export type CohortTableProps = {
  cohorts: CohortRow[];
};

/**
 * Returns a Tailwind bg class for a retention percentage.
 * Higher retention = darker green.
 */
function retentionColor(value: number): string {
  if (value >= 80) return "bg-green-600 text-white";
  if (value >= 60) return "bg-green-500 text-white";
  if (value >= 40) return "bg-green-400 text-white";
  if (value >= 20) return "bg-green-300 text-green-900";
  if (value > 0) return "bg-green-200 text-green-900";
  return "bg-muted text-muted-foreground";
}

export function CohortTable({ cohorts }: CohortTableProps) {
  const { t } = useTranslation("analytics");

  // Determine max number of weeks across all cohorts
  const maxWeeks = Math.max(...cohorts.map((c) => c.retentionByWeek.length), 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("cohorts.title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card">Cohort</TableHead>
              <TableHead>Size</TableHead>
              {Array.from({ length: maxWeeks }).map((_, i) => (
                <TableHead
                  key={i}
                  className={i >= 4 ? "hidden lg:table-cell" : undefined}
                >
                  {t("cohorts.week", { n: i + 1 })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((row) => (
              <TableRow key={row.cohort}>
                <TableCell className="sticky left-0 z-10 bg-card font-medium whitespace-nowrap">
                  {row.cohort}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.size.toLocaleString()}
                </TableCell>
                {Array.from({ length: maxWeeks }).map((_, i) => {
                  const value = row.retentionByWeek[i];
                  const hasValue = value !== undefined;
                  return (
                    <TableCell
                      key={i}
                      className={i >= 4 ? "hidden lg:table-cell" : undefined}
                    >
                      {hasValue ? (
                        <span
                          className={`inline-flex h-7 w-12 items-center justify-center rounded text-xs font-medium ${retentionColor(value)}`}
                        >
                          {value.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
