import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawConversation, RawPaginatedConversations, RawMessage, RawMessagesList } from "@/features/messages/schemas";

type Params = Record<string, string | undefined>;

const PREVIEWS = [
  "Hey! How are you doing?",
  "Had a great time last night!",
  "Want to grab coffee this weekend?",
  "I love your photos!",
  "Are you free tomorrow evening?",
  "That's so funny haha",
  "Just saw your profile, we have a lot in common!",
  "Thanks for the match!",
  "Good morning! Hope you have a great day",
  "Let me know when you're free",
];

const MESSAGE_CONTENTS = [
  "Hey there! Nice to meet you.",
  "How's your day going?",
  "I noticed we both like hiking!",
  "Have you been to that new restaurant downtown?",
  "Thanks! I took that photo last summer.",
  "Would you like to meet up sometime?",
  "Haha that's hilarious!",
  "I'm free this weekend if you want to do something.",
  "Tell me more about yourself!",
  "That sounds like a lot of fun.",
  "I've been meaning to try that place.",
  "What do you do for work?",
  "Any plans for the holidays?",
  "I love that movie too!",
  "Send me your playlist!",
];

const FLAG_REASONS = [
  "Inappropriate language",
  "Spam or solicitation",
  "Threatening behavior",
  "Sharing personal information",
  null,
  null,
  null,
  null,
];

function buildConversations(tenantId: string): RawConversation[] {
  const users = db.usersFor(tenantId);
  const rng = createRng(tenantId.length * 41 + 13);
  const count = Math.min(50, Math.floor(users.length / 2));
  return Array.from({ length: count }, (_, i) => {
    const a = users[rng.int(0, users.length - 1)];
    let bIdx = rng.int(0, users.length - 1);
    if (bIdx === users.indexOf(a)) bIdx = (bIdx + 1) % users.length;
    const b = users[bIdx];
    const msgCount = rng.int(1, 80);
    const flagCount = rng.bool(0.15) ? rng.int(1, 4) : 0;
    const daysAgo = rng.int(0, 45);
    return {
      id: `conv_${tenantId}_${String(i + 1).padStart(4, "0")}`,
      participant_a_name: a.display_name,
      participant_a_id: a.id,
      participant_a_avatar_url: a.avatar_url,
      participant_b_name: b.display_name,
      participant_b_id: b.id,
      participant_b_avatar_url: b.avatar_url,
      last_message_preview: rng.pick(PREVIEWS),
      last_message_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      message_count: msgCount,
      flag_count: flagCount,
      is_flagged: flagCount > 0,
    };
  });
}

function buildMessages(conversationId: string, tenantId: string): RawMessage[] {
  const users = db.usersFor(tenantId);
  const rng = createRng(conversationId.length * 7 + 19);
  const count = rng.int(5, 25);
  const a = users[rng.int(0, users.length - 1)];
  const b = users[rng.int(0, users.length - 1)];
  return Array.from({ length: count }, (_, i) => {
    const sender = i % 2 === 0 ? a : b;
    const flagReason = rng.pick(FLAG_REASONS);
    return {
      id: `msg_${conversationId}_${String(i + 1).padStart(3, "0")}`,
      conversation_id: conversationId,
      sender_id: sender.id,
      sender_name: sender.display_name,
      content: rng.pick(MESSAGE_CONTENTS),
      sent_at: new Date(Date.now() - (count - i) * 3_600_000).toISOString(),
      is_flagged: flagReason !== null,
      flag_reason: flagReason,
    };
  });
}

const convCache: Record<string, RawConversation[]> = {};

function getConversations(tenantId: string): RawConversation[] {
  if (!convCache[tenantId]) convCache[tenantId] = buildConversations(tenantId);
  return convCache[tenantId];
}

export function list(tenantId: string | null, params: Params): RawPaginatedConversations {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getConversations(tenantId);
  const search = (params.search ?? "").trim().toLowerCase();
  const flagged = params.flagged;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (flagged === "true" && !item.is_flagged) return false;
    if (flagged === "false" && item.is_flagged) return false;
    if (search && !item.participant_a_name.toLowerCase().includes(search) && !item.participant_b_name.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}

export function messages(tenantId: string | null, conversationId: string): RawMessagesList {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return { items: buildMessages(conversationId, tenantId) };
}

export function flagMessage(tenantId: string | null, messageId: string, body: unknown): RawMessage {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const reason = (body as { reason?: string })?.reason ?? "Flagged by admin";
  return {
    id: messageId,
    conversation_id: "unknown",
    sender_id: "unknown",
    sender_name: "Unknown",
    content: "",
    sent_at: new Date().toISOString(),
    is_flagged: true,
    flag_reason: reason,
  };
}
