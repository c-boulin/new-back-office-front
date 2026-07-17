import type { MessageThread, PaginatedMessageThreads } from "./types";
import type { RawMessageThread, RawPaginatedMessageThreads } from "./schemas";

export function messageThreadFromRaw(raw: RawMessageThread): MessageThread {
  return {
    id: raw.id,
    participantA: raw.participant_a,
    participantB: raw.participant_b,
    lastMessagePreview: raw.last_message_preview,
    lastMessageAt: raw.last_message_at,
    messageCount: raw.message_count,
    flag: raw.flag,
  };
}

export function paginatedMessageThreadsFromRaw(
  raw: RawPaginatedMessageThreads,
): PaginatedMessageThreads {
  return {
    items: raw.items.map(messageThreadFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
