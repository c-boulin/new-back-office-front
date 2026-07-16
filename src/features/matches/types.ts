export type Match = {
  id: string;
  userAName: string;
  userAId: string;
  userAAvatarUrl: string | null;
  userBName: string;
  userBId: string;
  userBAvatarUrl: string | null;
  matchedAt: string;
  firstMessageAt: string | null;
  conversationLength: number;
  isActive: boolean;
};

export type PaginatedMatches = {
  items: Match[];
  total: number;
  page: number;
  pageSize: number;
};

export type MatchesQuery = {
  search?: string;
  active?: boolean | "all";
  page: number;
  pageSize: number;
};
