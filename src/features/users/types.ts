export type UserStatus = "active" | "banned" | "shadow_banned" | "unverified" | "deleted";

export type UserRecord = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  isVerified: boolean;
  isPremium: boolean;
  reportCount: number;
  matchesCount: number;
  createdAt: string;
  lastActiveAt: string | null;
  city: string | null;
  country: string | null;
};

export type PaginatedUsers = {
  items: UserRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type UsersQuery = {
  search?: string;
  status?: UserStatus | "all";
  page: number;
  pageSize: number;
};
