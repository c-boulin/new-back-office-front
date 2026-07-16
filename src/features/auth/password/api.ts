import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { passwordSessionFromRaw } from "./adaptors";
import { passwordSessionSchema } from "./schemas";
import type { PasswordCredentials, PasswordSession } from "./types";

export async function passwordLogin(
  credentials: PasswordCredentials,
): Promise<PasswordSession> {
  const { data } = await httpClient.post("/auth/login", credentials);
  return validateAndAdapt(data, passwordSessionSchema, passwordSessionFromRaw);
}

export async function passwordRefresh(
  refreshToken: string,
): Promise<PasswordSession> {
  const { data } = await httpClient.post("/auth/refresh", { refresh_token: refreshToken });
  return validateAndAdapt(data, passwordSessionSchema, passwordSessionFromRaw);
}

export async function passwordLogout(refreshToken: string | null): Promise<void> {
  await httpClient.post("/auth/logout", { refresh_token: refreshToken });
}
