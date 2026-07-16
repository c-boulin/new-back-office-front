import type { Match, PaginatedMatches } from "./types";
import type { RawMatch, RawPaginatedMatches } from "./schemas";

export function matchFromRaw(raw: RawMatch): Match {
  return {
    id: raw.id,
    userAName: raw.user_a_name,
    userAId: raw.user_a_id,
    userAAvatarUrl: raw.user_a_avatar_url,
    userBName: raw.user_b_name,
    userBId: raw.user_b_id,
    userBAvatarUrl: raw.user_b_avatar_url,
    matchedAt: raw.matched_at,
    firstMessageAt: raw.first_message_at,
    conversationLength: raw.conversation_length,
    isActive: raw.is_active,
  };
}

export function paginatedMatchesFromRaw(raw: RawPaginatedMatches): PaginatedMatches {
  return {
    items: raw.items.map(matchFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
