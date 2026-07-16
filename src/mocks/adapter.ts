import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { AppError } from "@/lib/httpClient";
import { withLatency } from "./latency";
import { mockRouter, type MockRequest } from "./router";

function normalizeUrl(config: AxiosRequestConfig): string {
  const raw = config.url ?? "";
  if (/^https?:/i.test(raw)) return new URL(raw).pathname;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function headerBag(config: AxiosRequestConfig): Record<string, string | null> {
  const bag: Record<string, string | null> = {};
  const merged = config.headers ?? {};
  const entries = typeof (merged as { toJSON?: () => object }).toJSON === "function"
    ? Object.entries((merged as { toJSON: () => Record<string, unknown> }).toJSON())
    : Object.entries(merged as Record<string, unknown>);
  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    bag[key.toLowerCase()] = String(value);
  }
  return bag;
}

function paramBag(config: AxiosRequestConfig): Record<string, string | undefined> {
  const source = (config.params ?? {}) as Record<string, unknown>;
  const bag: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null) continue;
    bag[key] = String(value);
  }
  return bag;
}

function parseBody(config: AxiosRequestConfig): unknown {
  const { data } = config;
  if (data == null) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export const mockAdapter: AxiosAdapter = async (config) => {
  const request: MockRequest = {
    method: (config.method ?? "get").toUpperCase(),
    url: normalizeUrl(config),
    params: paramBag(config),
    body: parseBody(config),
    headers: headerBag(config),
  };

  try {
    const response = await withLatency(() => mockRouter(request));
    return {
      data: response.data,
      status: response.status,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    } as AxiosResponse;
  } catch (error) {
    const err = error instanceof AppError ? error : null;
    const status = err?.status ?? 500;
    const message = err?.message ?? "Mock handler error";
    return Promise.reject({
      isAxiosError: true,
      message,
      config,
      response: {
        data: { message, code: err?.code ?? "server" },
        status,
        statusText: err?.code ?? "server_error",
        headers: {},
        config,
      },
    });
  }
};
