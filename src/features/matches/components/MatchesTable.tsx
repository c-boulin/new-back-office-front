import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import type { Match } from "../types";
import type { ServerPagination } from "@/components/common/DataTable";

export type MatchesTableProps = {
  data: Match[];
  serverPagination: ServerPagination;
  emptyTitle: string;
  emptyDescription: string;
  translations: {
    columns: {
      users: string;
      matched: string;
      firstMessage: string;
      messages: string;
      status: string;
    };
    active: string;
    inactive: string;
    noFirstMessage: string;
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

function AvatarCircle({ name }: { name: string }) {
  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(name)}`}
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function MatchesTable({
  data,
  serverPagination,
  emptyTitle,
  emptyDescription,
  translations: t,
}: MatchesTableProps) {
  const columns = useMemo<ColumnDef<Match, unknown>[]>(
    () => [
      {
        id: "users",
        header: t.columns.users,
        cell: ({ row }) => {
          const match = row.original;
          return (
            <div className="flex items-center gap-2">
              <AvatarCircle name={match.userAName} />
              <span className="text-sm font-medium">{match.userAName}</span>
              <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500" aria-hidden />
              <AvatarCircle name={match.userBName} />
              <span className="text-sm font-medium">{match.userBName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "matchedAt",
        header: t.columns.matched,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.matchedAt), {
              addSuffix: true,
            })}
          </span>
        ),
      },
      {
        accessorKey: "firstMessageAt",
        header: t.columns.firstMessage,
        cell: ({ row }) => {
          const firstMessageAt = row.original.firstMessageAt;
          if (!firstMessageAt) {
            return (
              <span className="text-sm text-muted-foreground">
                {t.noFirstMessage}
              </span>
            );
          }
          return (
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(firstMessageAt), {
                addSuffix: true,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "conversationLength",
        header: t.columns.messages,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {row.original.conversationLength}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: t.columns.status,
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "outline"}>
            {row.original.isActive ? t.active : t.inactive}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable<Match>
      columns={columns}
      data={data}
      serverPagination={serverPagination}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getRowId={(row) => row.id}
    />
  );
}
