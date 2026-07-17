export type SubscriptionPlan = {
  id: string;
  name: string;
  monthlyPriceCents: number;
  currency: string;
  activeCount: number;
  churnRatePct: number;
};

export type SubscriptionsOverview = {
  activeCount: number;
  monthlyRecurringRevenueCents: number;
  currency: string;
  churnRatePct: number;
  arpuCents: number;
  plans: SubscriptionPlan[];
  revenueByMonth: { month: string; cents: number }[];
};
