import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activitySentence, formatRelativeTime } from "@/features/dashboard/format";
import type { RecentActivityItem } from "@/features/dashboard/types";

type Props = { items: RecentActivityItem[] };

export function RecentActivityList({ items }: Props) {
  const { t, i18n } = useTranslation("dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sections.recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title={t("sections.noActivity")} icon={Activity} />
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const sentence = activitySentence(item);
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {item.actor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t(sentence.key, sentence.values)}</p>
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
        )}
      </CardContent>
    </Card>
  );
}
