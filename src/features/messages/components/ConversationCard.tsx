import { Flag, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/features/messages/types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

type ConversationCardProps = {
  conversation: Conversation;
  onSelect: (id: string) => void;
};

export function ConversationCard({ conversation, onSelect }: ConversationCardProps) {
  const { id, participantAName, participantBName, lastMessagePreview, lastMessageAt, messageCount, flagCount, isFlagged } = conversation;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <CardContent className="flex items-start gap-3 p-4">
        {/* Avatars */}
        <div className="flex -space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground ring-2 ring-background">
            {initial(participantAName)}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground ring-2 ring-background">
            {initial(participantBName)}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">
              {participantAName} &amp; {participantBName}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(lastMessageAt)}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {lastMessagePreview}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3" aria-hidden />
              {messageCount}
            </span>

            {flagCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <Flag className="h-3 w-3" aria-hidden />
                {flagCount}
              </span>
            )}

            {isFlagged && (
              <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                Flagged
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
