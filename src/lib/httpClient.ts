import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { env } from "./env";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { oidcClient } from "./oidcClient";

export type ApiErrorCode =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "server"
  | "unknown";

export class AppError extends Error {
  override readonly name = "AppError";
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

function mapStatus(status: number | undefined): ApiErrorCode {
  if (status === undefined) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  const tenantId = useTenantStore.getState().activeTenantId;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  if (tenantId) config.headers.set("X-Tenant-Id", tenantId);
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshSsoSession(): Promise<string | null> {
  const renewed = await oidcClient.signinSilent();
  const token = renewed?.access_token ?? null;
  if (token) {
    useAuthStore.getState().setSession({
      accessToken: token,
      idToken: renewed?.id_token ?? null,
      expiresAt: renewed?.expires_at ?? null,
      method: "sso",
    });
  }
  return token;
}

async function refreshPasswordSession(): Promise<string | null> {
  const state = useAuthStore.getState();
  if (!state.refreshToken) return null;
  const { passwordRefresh } = await import("@/features/auth/password/api");
  const session = await passwordRefresh(state.refreshToken);
  useAuthStore.getState().setSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    method: "password",
  });
  useAuthStore.getState().setUser(session.user, session.memberships);
  return session.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const method = useAuthStore.getState().method;
      if (method === "password") return await refreshPasswordSession();
      if (method === "sso") return await refreshSsoSession();
      return null;
    } catch {
      useAuthStore.getState().markSessionExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers?.set("Authorization", `Bearer ${token}`);
        return httpClient.request(original);
      }
    }

    const code = mapStatus(status);
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Request failed";
    return Promise.reject(new AppError(code, message, status, error.response?.data));
  },
);
