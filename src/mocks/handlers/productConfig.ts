import { AppError } from "@/lib/httpClient";
import { buildProductConfig } from "../seeds/productConfig";
import type { RawProductConfig } from "@/features/productConfig/schemas";

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

const store: Record<string, RawProductConfig> = {};

export function get(tenantId: string | null): RawProductConfig {
  const id = requireTenant(tenantId);
  if (!store[id]) return buildProductConfig(Number(id) || 69);
  return store[id];
}

export function update(
  tenantId: string | null,
  body: unknown,
): RawProductConfig {
  const id = requireTenant(tenantId);
  const payload = body as Omit<RawProductConfig, "productId" | "isDefault">;
  const productId = Number(id) || 69;
  const next: RawProductConfig = {
    productId,
    isDefault: false,
    registration: payload.registration,
    relations: payload.relations,
    suggestions: payload.suggestions,
    likes: payload.likes,
    photos: payload.photos,
    quizz: payload.quizz,
    defaultTypes: payload.defaultTypes,
    legalLinks: payload.legalLinks,
  };
  store[id] = next;
  return next;
}

export function remove(tenantId: string | null): void {
  const id = requireTenant(tenantId);
  delete store[id];
}
