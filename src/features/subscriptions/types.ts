export type PlanTier = "free" | "basic" | "premium" | "vip";

export type Plan = {
  id: string;
  name: string;
  tier: PlanTier;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  subscriberCount: number;
  isActive: boolean;
};

export type SubscriberStatus = "active" | "cancelled" | "expired" | "trial";

export type Subscriber = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  planTier: PlanTier;
  status: SubscriberStatus;
  startedAt: string;
  expiresAt: string;
  amountPaid: number;
  currency: string;
};

export type PaginatedSubscribers = {
  items: Subscriber[];
  total: number;
  page: number;
  pageSize: number;
};

export type SubscribersQuery = {
  search?: string;
  status?: SubscriberStatus | "all";
  tier?: PlanTier | "all";
  page: number;
  pageSize: number;
};

export type SubscriptionOverview = {
  plans: Plan[];
  totalRevenue: number;
  activeSubscribers: number;
  churnRate: number;
};
