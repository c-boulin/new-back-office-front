import { httpClient } from "@/lib/httpClient";
import { env } from "@/lib/env";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { passwordSessionFromRaw } from "./adaptors";
import { passwordSessionSchema } from "./schemas";
import type { PasswordCredentials, PasswordSession } from "./types";
import {
  mockPasswordLogin,
  mockPasswordLogout,
  mockPasswordRefresh,
} from "./mock";

export async function passwordLogin(
  credentials: PasswordCredentials,
): Promise<PasswordSession> {
  const raw = env.auth.mocked
    ? await mockPasswordLogin(credentials.identifier, credentials.password)
    : (await httpClient.post("/auth/login", credentials)).data;
  return validateAndAdapt(raw, passwordSessionSchema, passwordSessionFromRaw);
}

export async function passwordRefresh(
  refreshToken: string,
): Promise<PasswordSession> {
  const raw = env.auth.mocked
    ? await mockPasswordRefresh(refreshToken)
    : (await httpClient.post("/auth/refresh", { refresh_token: refreshToken })).data;
  return validateAndAdapt(raw, passwordSessionSchema, passwordSessionFromRaw);
}

export async function passwordLogout(refreshToken: string | null): Promise<void> {
  if (env.auth.mocked) {
    await mockPasswordLogout();
    return;
  }
  await httpClient.post("/auth/logout", { refresh_token: refreshToken });
}
