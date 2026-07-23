import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { env } from "./env";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";

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
    public readonly requestId?: string,
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

const REAL_BACKEND_PREFIXES = ["/v1/auth/sso/", "/v1/products", "/v1/roles"] as const;

function shouldBypassMockAdapter(url: string | undefined): boolean {
  if (!env.auth.ssoBypassMock) return false;
  if (!url) return false;
  const path = url.split("?")[0];
  return REAL_BACKEND_PREFIXES.some((prefix) => path.startsWith(prefix));
}

if (env.mock.api) {
  const adapterPromise = import("@/mocks").then((m) => m.mockAdapter);
  httpClient.interceptors.request.use(async (config) => {
    if (shouldBypassMockAdapter(config.url)) return config;
    config.adapter = await adapterPromise;
    return config;
  });
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  const stripped = url.split("?")[0];
  return stripped.startsWith("/v1/auth/") || stripped === "/v1/auth";
}

function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  const stripped = url.split("?")[0];
  return stripped === "/v1/products" || stripped.startsWith("/v1/products?");
}

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  if (!isAuthEndpoint(config.url) && !isPublicEndpoint(config.url)) {
    const activeTenantId = useTenantStore.getState().activeTenantId;
    if (activeTenantId !== null) {
      const params = (config.params ?? {}) as Record<string, unknown>;
      if (params.product_id === undefined) {
        config.params = { ...params, product_id: activeTenantId };
      }
    }
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const state = useAuthStore.getState();
      if (!state.refreshToken) {
        state.markSessionExpired();
        return null;
      }
      const response = await axios.post<{ access_token: string }>(
        "/v1/auth/refresh",
        { refresh_token: state.refreshToken },
        { baseURL: env.apiBaseUrl, timeout: 20_000 },
      );
      const token = response.data.access_token;
      if (!token) {
        useAuthStore.getState().markSessionExpired();
        return null;
      }
      useAuthStore.getState().updateAccessToken(token);
      return token;
    } catch {
      useAuthStore.getState().markSessionExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function extractRequestId(error: AxiosError): string | undefined {
  const headerId = error.response?.headers?.["x-request-id"];
  if (typeof headerId === "string") return headerId;
  const body = error.response?.data as { request_id?: unknown } | undefined;
  if (body && typeof body.request_id === "string") return body.request_id;
  return undefined;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    if (status === 401 && original && !original._retried && !isAuthEndpoint(original.url)) {
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
    return Promise.reject(
      new AppError(code, message, status, error.response?.data, extractRequestId(error)),
    );
  },
);
