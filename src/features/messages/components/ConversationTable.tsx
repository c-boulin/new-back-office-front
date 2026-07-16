import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
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

type Translations = {
  participants: string;
  lastMessage: string;
  messages: string;
  flags: string;
  date: string;
  actions: string;
  viewThread: string;
  emptyTitle: string;
  emptyDescription: string;
};

type ConversationTableProps = {
  data: Conversation[];
  translations: Translations;
  pagination: PaginationState;
  onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
  pageCount: number;
  onViewThread: (id: string) => void;
};

function buildColumns(
  translations: Translations,
  onViewThread: (id: string) => void,
): ColumnDef<Conversation, unknown>[] {
  return [
    {
      id: "participants",
      header: translations.participants,
      cell: ({ row }) => {
        const { participantAName, participantBName } = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground ring-2 ring-background">
                {initial(participantAName)}
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground ring-2 ring-background">
                {initial(participantBName)}
              </div>
            </div>
            <span className="text-sm font-medium">
              {participantAName} &amp; {participantBName}
            </span>
          </div>
        );
      },
    },
    {
      id: "lastMessage",
      header: translations.lastMessage,
      cell: ({ row }) => (
        <p className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.lastMessagePreview}
        </p>
      ),
    },
    {
      id: "messages",
      header: translations.messages,
      accessorFn: (r) => r.messageCount,
    },
    {
      id: "flags",
      header: translations.flags,
      cell: ({ row }) => {
        const count = row.original.flagCount;
        if (count === 0) return <span className="text-muted-foreground">0</span>;
        return <Badge variant="destructive">{count}</Badge>;
      },
    },
    {
      id: "date",
      header: translations.date,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {timeAgo(row.original.lastMessageAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewThread(row.original.id)}
        >
          <Eye className="mr-1 h-4 w-4" />
          {translations.viewThread}
        </Button>
      ),
    },
  ];
}

export function ConversationTable({
  data,
  translations,
  pagination,
  onPaginationChange,
  pageCount,
  onViewThread,
}: ConversationTableProps) {
  const columns = buildColumns(translations, onViewThread);

  return (
    <DataTable<Conversation>
      columns={columns}
      data={data}
      serverPagination={{
        pagination,
        onPaginationChange,
        pageCount,
      }}
      emptyTitle={translations.emptyTitle}
      emptyDescription={translations.emptyDescription}
      getRowId={(row) => row.id}
    />
  );
}
