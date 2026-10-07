import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { ActivityType, Kpi, RecentActivityItem } from "./types";

export type Trend = { direction: "up" | "down" | "flat"; label: string };

export function formatVariation(variation: number, noChangeLabel: string): Trend {
  if (variation === 0) return { direction: "flat", label: noChangeLabel };
  const sign = variation > 0 ? "+" : "";
  return {
    direction: variation > 0 ? "up" : "down",
    label: `${sign}${(variation * 100).toFixed(1)}%`,
  };
}

export function chartSeries(kpis: Record<string, Kpi>): Kpi["series"] {
  const primary = kpis.activeUsers?.series ?? [];
  if (primary.length > 0) return primary;
  return Object.values(kpis).find((kpi) => kpi.series.length > 0)?.series ?? [];
}

const SOLO_TYPES: ReadonlySet<ActivityType> = new Set(["signup", "verified"]);

export function activitySentence(item: RecentActivityItem): {
  key: string;
  values: { actor: string; target?: string };
} {
  const actor = item.actor.name;
  if (SOLO_TYPES.has(item.type)) return { key: `activity.${item.type}`, values: { actor } };
  if (item.target) return { key: `activity.${item.type}`, values: { actor, target: item.target.name } };
  return { key: `activity.${item.type}NoTarget`, values: { actor } };
}

export function formatRelativeTime(iso: string, language: string): string {
  return formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: language.startsWith("fr") ? fr : enUS,
  });
}
