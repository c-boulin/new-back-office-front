import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedConversationsSchema, rawMessagesListSchema } from "./schemas";
import { paginatedConversationsFromRaw, messagesListFromRaw } from "./adaptors";
import type { PaginatedConversations, ConversationsQuery, Message } from "./types";

export async function listConversations(query: ConversationsQuery): Promise<PaginatedConversations> {
  const { data } = await httpClient.get("/messages/conversations", {
    params: {
      search: query.search || undefined,
      flagged: query.flagged !== "all" ? query.flagged : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedConversationsSchema, paginatedConversationsFromRaw);
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const { data } = await httpClient.get(`/messages/conversations/${conversationId}/messages`);
  return validateAndAdapt(data, rawMessagesListSchema, messagesListFromRaw);
}

export async function flagMessage(messageId: string, reason: string): Promise<void> {
  await httpClient.post(`/messages/${messageId}/flag`, { reason });
}
