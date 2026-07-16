import type { AuditAction, AuditEvent, PaginatedAuditEvents } from "./types";
import type { RawAuditEvent, RawPaginatedAudit } from "./schemas";

export function auditEventFromRaw(raw: RawAuditEvent): AuditEvent {
  return {
    id: raw.id,
    actorName: raw.actor_name,
    actorId: raw.actor_id,
    action: raw.action as AuditAction,
    entityType: raw.entity_type,
    entityId: raw.entity_id,
    entityLabel: raw.entity_label,
    tenantId: raw.tenant_id,
    occurredAt: raw.occurred_at,
    metadata: raw.metadata,
  };
}

export function paginatedAuditFromRaw(raw: RawPaginatedAudit): PaginatedAuditEvents {
  return {
    items: raw.items.map(auditEventFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
