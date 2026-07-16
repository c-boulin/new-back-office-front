import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "../types";

export type MatchCardProps = {
  match: Match;
  translations: {
    matchedAgo: string;
    firstMessage: string;
    messages: string;
    active: string;
    inactive: string;
  };
};

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(name)}`}
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function MatchCard({ match, translations: t }: MatchCardProps) {
  const matchedAgo = formatDistanceToNow(new Date(match.matchedAt), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <Avatar name={match.userAName} />
              <Avatar name={match.userBName} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold">
                  {match.userAName}
                </span>
                <Heart className="h-3 w-3 shrink-0 fill-rose-500 text-rose-500" aria-hidden />
                <span className="truncate text-sm font-semibold">
                  {match.userBName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.matchedAgo.replace("{{time}}", matchedAgo)}
              </p>
            </div>
          </div>
          <Badge variant={match.isActive ? "success" : "outline"}>
            {match.isActive ? t.active : t.inactive}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span>
              {match.conversationLength} {t.messages}
            </span>
          </div>
        </div>
        {match.firstMessageAt && (
          <p className="text-xs text-muted-foreground">
            {t.firstMessage}:{" "}
            {formatDistanceToNow(new Date(match.firstMessageAt), {
              addSuffix: true,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
