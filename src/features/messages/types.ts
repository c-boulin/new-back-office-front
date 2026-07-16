export type Conversation = {
  id: string;
  participantAName: string;
  participantAId: string;
  participantAAvatarUrl: string | null;
  participantBName: string;
  participantBId: string;
  participantBAvatarUrl: string | null;
  lastMessagePreview: string;
  lastMessageAt: string;
  messageCount: number;
  flagCount: number;
  isFlagged: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isFlagged: boolean;
  flagReason: string | null;
};

export type PaginatedConversations = {
  items: Conversation[];
  total: number;
  page: number;
  pageSize: number;
};

export type ConversationsQuery = {
  search?: string;
  flagged?: boolean | "all";
  page: number;
  pageSize: number;
};
