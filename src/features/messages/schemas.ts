import { z } from "zod";

export const rawConversationSchema = z.object({
  id: z.string(),
  participant_a_name: z.string(),
  participant_a_id: z.string(),
  participant_a_avatar_url: z.string().nullable(),
  participant_b_name: z.string(),
  participant_b_id: z.string(),
  participant_b_avatar_url: z.string().nullable(),
  last_message_preview: z.string(),
  last_message_at: z.string(),
  message_count: z.number().int().nonnegative(),
  flag_count: z.number().int().nonnegative(),
  is_flagged: z.boolean(),
});

export const rawPaginatedConversationsSchema = z.object({
  items: z.array(rawConversationSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export const rawMessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  sender_name: z.string(),
  content: z.string(),
  sent_at: z.string(),
  is_flagged: z.boolean(),
  flag_reason: z.string().nullable(),
});

export const rawMessagesListSchema = z.object({
  items: z.array(rawMessageSchema),
});

export type RawConversation = z.infer<typeof rawConversationSchema>;
export type RawPaginatedConversations = z.infer<typeof rawPaginatedConversationsSchema>;
export type RawMessage = z.infer<typeof rawMessageSchema>;
export type RawMessagesList = z.infer<typeof rawMessagesListSchema>;
