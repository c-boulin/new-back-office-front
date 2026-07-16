import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedSubscribersSchema, rawSubscriptionOverviewSchema } from "./schemas";
import { paginatedSubscribersFromRaw, subscriptionOverviewFromRaw } from "./adaptors";
import type { PaginatedSubscribers, SubscribersQuery, SubscriptionOverview } from "./types";

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  const { data } = await httpClient.get("/subscriptions/overview");
  return validateAndAdapt(data, rawSubscriptionOverviewSchema, subscriptionOverviewFromRaw);
}

export async function listSubscribers(query: SubscribersQuery): Promise<PaginatedSubscribers> {
  const { data } = await httpClient.get("/subscriptions/subscribers", {
    params: {
      search: query.search || undefined,
      status: query.status && query.status !== "all" ? query.status : undefined,
      tier: query.tier && query.tier !== "all" ? query.tier : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedSubscribersSchema, paginatedSubscribersFromRaw);
}

export async function refundSubscriber(id: string): Promise<void> {
  await httpClient.post(`/subscriptions/subscribers/${id}/refund`);
}

export async function cancelSubscription(id: string): Promise<void> {
  await httpClient.post(`/subscriptions/subscribers/${id}/cancel`);
}
