export type ModerationItemType = "profile" | "photo" | "message" | "report";
export type ModerationItemStatus = "pending" | "approved" | "rejected" | "escalated";
export type ModerationAiDecision = "accepted" | "refused" | "unknown";
export type ModerationContentKind = "nickname" | "profile_photo" | "story" | "message";

export type ModerationItem = {
  id: string;
  type: ModerationItemType;
  status: ModerationItemStatus;
  reason: string;
  reportedBy: string | null;
  subjectName: string;
  subjectId: string;
  content: string;
  contentHtml: string | null;
  imageUrl: string | null;
  severity: "low" | "medium" | "high";
  createdAt: string;
  aiDecision: ModerationAiDecision;
  contentKind: ModerationContentKind;
  contentPreview: string | null;
};

export type PaginatedModeration = {
  items: ModerationItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ModerationQuery = {
  status?: ModerationItemStatus | "all";
  type?: ModerationItemType | "all";
  kind?: ModerationContentKind | "all";
  page: number;
  pageSize: number;
};

export type ModerationStats = {
  totalProcessed: number;
  pending: number;
  confirmed: number;
  reverted: number;
  aiRefused: number;
  aiAccepted: number;
};
