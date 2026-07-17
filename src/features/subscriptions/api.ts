import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { subscriptionsOverviewSchema } from "./schemas";
import { subscriptionsFromRaw } from "./adaptors";
import type { SubscriptionsOverview } from "./types";

export async function getSubscriptionsOverview(): Promise<SubscriptionsOverview> {
  const { data } = await httpClient.get("/subscriptions/overview");
  return validateAndAdapt(data, subscriptionsOverviewSchema, subscriptionsFromRaw);
}
