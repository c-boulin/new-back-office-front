import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import {
  loginResponseSchema,
  meResponseSchema,
  ssoInitResponseSchema,
} from "@/features/tenants/schemas";
import { loginResponseToSession, meResponseToMe } from "./adaptors";
import type { AuthSession, MeResponse, PasswordCredentials } from "./types";

export async function passwordLogin(
  credentials: PasswordCredentials,
): Promise<AuthSession> {
  const { data } = await httpClient.post("/v1/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return validateAndAdapt(data, loginResponseSchema, loginResponseToSession);
}

export async function ssoInit(callbackUrl: string): Promise<string> {
  const { data } = await httpClient.get("/v1/auth/sso/init", {
    params: {
      callback_url: callbackUrl,
    },
  });
  const parsed = validateAndAdapt(data, ssoInitResponseSchema, (r) => r);
  return parsed.data.url;
}

export async function ssoLogin(sesameToken: string): Promise<AuthSession> {
  const { data } = await httpClient.post("/v1/auth/sso/login", {
    sesame_token: sesameToken,
  });
  return validateAndAdapt(data, loginResponseSchema, loginResponseToSession);
}

export async function logoutRequest(): Promise<void> {
  try {
    await httpClient.post("/v1/auth/logout");
  } catch {
    // Tolerate 401 or network — the client-side session is dropped by the caller.
  }
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await httpClient.get("/v1/auth/me");
  return validateAndAdapt(data, meResponseSchema, meResponseToMe);
}
