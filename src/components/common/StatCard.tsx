import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  icon?: LucideIcon;
  className?: string;
};

const trendColor: Record<"up" | "down" | "flat", string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

export function StatCard({ label, value, hint, trend, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        {trend ? (
          <p className={cn("text-xs font-medium", trendColor[trend.direction])}>{trend.label}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
