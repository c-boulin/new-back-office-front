import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { AuditEvent } from "@/features/audit/types";

const ACTION_CATEGORY_COLORS: Record<string, string> = {
  user: "bg-blue-500",
  moderation: "bg-yellow-500",
  report: "bg-red-500",
  settings: "bg-green-500",
  subscription: "bg-purple-500",
};

function getActionCategory(action: string): string {
  return action.split(".")[0];
}

function formatAction(action: string): string {
  const formatted = action.replace(/\./g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type AuditEventCardProps = {
  event: AuditEvent;
};

export function AuditEventCard({ event }: AuditEventCardProps) {
  const category = getActionCategory(event.action);
  const dotColor = ACTION_CATEGORY_COLORS[category] ?? "bg-gray-400";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug">
            <span className="font-bold">{event.actorName}</span>{" "}
            <span className="text-muted-foreground">{formatAction(event.action)}</span>{" "}
            <span>{event.entityLabel}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
