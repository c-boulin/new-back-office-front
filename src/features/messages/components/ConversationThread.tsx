import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Flag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { getConversationMessages } from "@/features/messages/api";
import { sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { Message } from "@/features/messages/types";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatBubble({
  message,
  isRight,
}: {
  message: Message;
  isRight: boolean;
}) {
  return (
    <div
      className={cn("flex flex-col max-w-[75%] gap-0.5", isRight ? "ml-auto items-end" : "items-start")}
    >
      <span className="text-[11px] font-medium text-muted-foreground px-1">
        {message.senderName}
      </span>
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-sm",
          isRight
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm",
          message.isFlagged && "border-2 border-destructive",
        )}
      >
        <p>{sanitizeText(message.content)}</p>
      </div>
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-muted-foreground">
          {formatTime(message.sentAt)}
        </span>
        {message.isFlagged && message.flagReason && (
          <span className="flex items-center gap-0.5 text-[10px] text-destructive">
            <Flag className="h-2.5 w-2.5" aria-hidden />
            {message.flagReason}
          </span>
        )}
      </div>
    </div>
  );
}

type ConversationThreadProps = {
  conversationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConversationThread({
  conversationId,
  open,
  onOpenChange,
}: ConversationThreadProps) {
  const { t } = useTranslation("messages");

  const query = useQuery({
    queryKey: ["messages", "conversation", conversationId],
    queryFn: () => getConversationMessages(conversationId!),
    enabled: Boolean(conversationId) && open,
  });

  // Determine which sender is "right" (second unique sender or fallback)
  const messages = query.data ?? [];
  const firstSenderId = messages.length > 0 ? messages[0].senderId : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("thread.title")}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          {query.isPending ? (
            <LoadingState rows={6} />
          ) : query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : messages.length === 0 ? (
            <EmptyState title={t("thread.empty")} />
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isRight={msg.senderId !== firstSenderId}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
