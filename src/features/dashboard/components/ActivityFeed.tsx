import { formatDistanceToNow } from "date-fns";
import type { ActivityItem } from "../types";
import { cn } from "@/lib/utils";

export type ActivityFeedProps = {
  items: ActivityItem[];
  className?: string;
};

const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No recent activity
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
              getAvatarColor(item.actorName),
            )}
            aria-hidden
          >
            {item.actorName.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug">
              <span className="font-medium">{item.actorName}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium">{item.targetName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(item.occurredAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
