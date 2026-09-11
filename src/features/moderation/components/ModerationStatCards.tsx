import { useTranslation } from "react-i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClipboardList, Clock, ShieldCheck, RotateCcw, ShieldX, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchModerationStats } from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { cn } from "@/lib/utils";

type Tile = {
  key: "totalProcessed" | "pending" | "confirmed" | "reverted" | "aiRefused" | "aiAccepted";
  icon: LucideIcon;
  tone: string;
};

const TILES: Tile[] = [
  { key: "totalProcessed", icon: ClipboardList, tone: "text-foreground" },
  { key: "pending", icon: Clock, tone: "text-amber-500" },
  { key: "confirmed", icon: ShieldCheck, tone: "text-emerald-500" },
  { key: "reverted", icon: RotateCcw, tone: "text-sky-500" },
  { key: "aiRefused", icon: ShieldX, tone: "text-rose-500" },
  { key: "aiAccepted", icon: Sparkles, tone: "text-primary" },
];

export function ModerationStatCards() {
  const { t } = useTranslation("moderation");
  const { id: tenantId } = useActiveTenant();
  const { data: stats } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "moderation", "stats"],
    queryFn: () => fetchModerationStats(),
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {TILES.map(({ key, icon: Icon, tone }) => (
        <div
          key={key}
          className="rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t(`stats.${key}`)}
            </span>
            <Icon className={cn("h-4 w-4", tone)} aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}
