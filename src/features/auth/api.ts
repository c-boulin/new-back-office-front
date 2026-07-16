import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { meResponseSchema } from "@/features/tenants/schemas";
import { meResponseFromRaw } from "./adaptors";
import type { MeResponse } from "./types";

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await httpClient.get("/auth/me");
  return validateAndAdapt(data, meResponseSchema, meResponseFromRaw);
}
