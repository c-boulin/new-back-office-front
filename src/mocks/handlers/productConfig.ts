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
  if (!store[id]) store[id] = buildProductConfig();
  return store[id];
}

export function update(
  tenantId: string | null,
  body: unknown,
): RawProductConfig {
  const id = requireTenant(tenantId);
  const patch = (body ?? {}) as Partial<RawProductConfig>;
  const current = store[id] ?? buildProductConfig();
  const next: RawProductConfig = {
    registration: { ...current.registration, ...patch.registration },
    relations: { ...current.relations, ...patch.relations },
    suggestions: { ...current.suggestions, ...patch.suggestions },
    photos: { ...current.photos, ...patch.photos },
    quizz: { ...current.quizz, ...patch.quizz },
    default_content_types: {
      ...current.default_content_types,
      ...patch.default_content_types,
    },
    likes: { ...current.likes, ...patch.likes },
    legal_links: { ...current.legal_links, ...patch.legal_links },
  };
  store[id] = next;
  return next;
}
