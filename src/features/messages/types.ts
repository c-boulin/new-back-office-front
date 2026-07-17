export type MessageThreadFlag = "harassment" | "spam" | "underage" | "explicit" | null;

export type MessageThread = {
  id: string;
  participantA: string;
  participantB: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  messageCount: number;
  flag: MessageThreadFlag;
};

export type PaginatedMessageThreads = {
  items: MessageThread[];
  total: number;
  page: number;
  pageSize: number;
};

export type MessageThreadsQuery = {
  flagged?: boolean;
  page: number;
  pageSize: number;
};
