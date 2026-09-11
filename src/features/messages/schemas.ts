import { z } from "zod";

export const messageThreadSchema = z.object({
  id: z.string(),
  participant_a: z.string(),
  participant_b: z.string(),
  last_message_preview: z.string(),
  last_message_at: z.string(),
  message_count: z.number().int().nonnegative(),
  flag: z.enum(["harassment", "spam", "underage", "explicit"]).nullable(),
});

export const paginatedMessageThreadsSchema = z.object({
  items: z.array(messageThreadSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawMessageThread = z.infer<typeof messageThreadSchema>;
export type RawPaginatedMessageThreads = z.infer<typeof paginatedMessageThreadsSchema>;
