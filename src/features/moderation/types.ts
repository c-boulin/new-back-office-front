export type ModerationItemType = "photo" | "bio" | "message" | "profile";
export type ModerationStatus = "pending" | "approved" | "rejected" | "escalated";

export type ModerationItem = {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl: string | null;
  type: ModerationItemType;
  content: string;
  reason: string;
  status: ModerationStatus;
  reportedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type PaginatedModeration = {
  items: ModerationItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ModerationQuery = {
  type?: ModerationItemType | "all";
  status?: ModerationStatus | "all";
  page: number;
  pageSize: number;
};
