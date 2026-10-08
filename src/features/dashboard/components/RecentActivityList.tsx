import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { activitySentence, formatRelativeTime } from "@/features/dashboard/format";
import type { RecentActivityItem } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

type Props = {
  items: RecentActivityItem[];
  /** Match the height of the neighbouring card on large screens instead of growing with the list. */
  fitRowHeight?: boolean;
};

export function RecentActivityList({ items, fitRowHeight = false }: Props) {
  const { t, i18n } = useTranslation("dashboard");

  return (
    <Card
      className={cn(
        "flex flex-col",
        // Zero height + full min-height keeps the list from driving the grid row height.
        fitRowHeight && "lg:h-0 lg:min-h-full",
      )}
    >
      <CardHeader>
        <CardTitle>{t("sections.recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState title={t("sections.noActivity")} icon={Activity} />
          </div>
        ) : (
          <ScrollArea className={cn("h-96", fitRowHeight && "lg:h-auto lg:min-h-0 lg:flex-1")}>
            <ul className="space-y-4 pr-3">
              {items.map((item) => {
                const sentence = activitySentence(item);
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {item.actor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t(sentence.key, sentence.values)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <time dateTime={item.occurredAt}>
                          {formatRelativeTime(item.occurredAt, i18n.language)}
                        </time>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
