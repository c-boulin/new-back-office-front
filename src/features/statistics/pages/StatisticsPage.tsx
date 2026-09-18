import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersTab } from "@/features/statistics/components/UsersTab";
import { EngagementTab } from "@/features/statistics/components/EngagementTab";
import { ModerationTab } from "@/features/statistics/components/ModerationTab";
import { RetentionTab } from "@/features/statistics/components/RetentionTab";
import type { StatsDateParams } from "@/features/statistics/types";

const DEFAULT_RANGE_DAYS = 6;

function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function defaultFrom(): string {
  return format(subDays(new Date(), DEFAULT_RANGE_DAYS), "yyyy-MM-dd");
}

export function StatisticsPage() {
  const { t } = useTranslation("statistics");

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [compare, setCompare] = useState<StatsDateParams["compare"]>("previous_period");

  const dateParams = useMemo<StatsDateParams>(
    () => ({ from, to, compare }),
    [from, to, compare],
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="stats-from">{t("filters.from")}</Label>
          <Input
            id="stats-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stats-to">{t("filters.to")}</Label>
          <Input
            id="stats-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stats-compare">{t("filters.compare")}</Label>
          <Select value={compare} onValueChange={(v) => setCompare(v as StatsDateParams["compare"])}>
            <SelectTrigger id="stats-compare" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous_period">{t("filters.previousPeriod")}</SelectItem>
              <SelectItem value="same_weekday">{t("filters.sameWeekday")}</SelectItem>
              <SelectItem value="none">{t("filters.none")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
          <TabsTrigger value="engagement">{t("tabs.engagement")}</TabsTrigger>
          <TabsTrigger value="moderation">{t("tabs.moderation")}</TabsTrigger>
          <TabsTrigger value="retention">{t("tabs.retention")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <RouteBoundary loadingFallback={<LoadingCards count={3} />}>
            <UsersTab dateParams={dateParams} />
          </RouteBoundary>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <RouteBoundary loadingFallback={<LoadingCards count={3} />}>
            <EngagementTab dateParams={dateParams} />
          </RouteBoundary>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <RouteBoundary loadingFallback={<LoadingCards count={4} />}>
            <ModerationTab />
          </RouteBoundary>
        </TabsContent>

        <TabsContent value="retention" className="mt-6">
          <RouteBoundary loadingFallback={<LoadingCards count={4} />}>
            <RetentionTab dateParams={dateParams} />
          </RouteBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
