import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { matchesOverviewSchema } from "./schemas";
import { matchesOverviewFromRaw } from "./adaptors";
import type { MatchesOverview } from "./types";

export async function getMatchesOverview(): Promise<MatchesOverview> {
  const { data } = await httpClient.get("/matches/overview");
  return validateAndAdapt(data, matchesOverviewSchema, matchesOverviewFromRaw);
}
