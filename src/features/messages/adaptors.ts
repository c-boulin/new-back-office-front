import type { Conversation, Message, PaginatedConversations } from "./types";
import type { RawConversation, RawMessage, RawPaginatedConversations, RawMessagesList } from "./schemas";

export function conversationFromRaw(raw: RawConversation): Conversation {
  return {
    id: raw.id,
    participantAName: raw.participant_a_name,
    participantAId: raw.participant_a_id,
    participantAAvatarUrl: raw.participant_a_avatar_url,
    participantBName: raw.participant_b_name,
    participantBId: raw.participant_b_id,
    participantBAvatarUrl: raw.participant_b_avatar_url,
    lastMessagePreview: raw.last_message_preview,
    lastMessageAt: raw.last_message_at,
    messageCount: raw.message_count,
    flagCount: raw.flag_count,
    isFlagged: raw.is_flagged,
  };
}

export function paginatedConversationsFromRaw(raw: RawPaginatedConversations): PaginatedConversations {
  return {
    items: raw.items.map(conversationFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}

export function messageFromRaw(raw: RawMessage): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    senderName: raw.sender_name,
    content: raw.content,
    sentAt: raw.sent_at,
    isFlagged: raw.is_flagged,
    flagReason: raw.flag_reason,
  };
}

export function messagesListFromRaw(raw: RawMessagesList): Message[] {
  return raw.items.map(messageFromRaw);
}
