import { useTranslation } from "react-i18next";
import { Activity, Flag, Handshake, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatVariation } from "@/features/dashboard/format";
import type { Kpi } from "@/features/dashboard/types";

const KPI_ICONS: Record<string, LucideIcon> = {
  activeUsers: Users,
  matches: Handshake,
  reportsPending: Flag,
  sessions: Activity,
};

export const TOP_ROW_KPIS = ["activeUsers", "matches", "reportsPending", "sessions"] as const;

type Props = { kpis: Record<string, Kpi> };

export function DashboardKpiRow({ kpis }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const numberFormat = new Intl.NumberFormat(i18n.language);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TOP_ROW_KPIS.map((key) => {
        const kpi = kpis[key];
        if (!kpi) return null;
        return (
          <StatCard
            key={key}
            label={t(`kpis.${key}`)}
            value={numberFormat.format(kpi.value)}
            hint={t(`hints.${key}`)}
            trend={formatVariation(kpi.variation, t("trend.noChange"))}
            icon={KPI_ICONS[key]}
          />
        );
      })}
    </div>
  );
}
