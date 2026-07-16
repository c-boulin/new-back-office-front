import { z } from "zod";

export const rawAuditEventSchema = z.object({
  id: z.string(),
  actor_name: z.string(),
  actor_id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  entity_label: z.string(),
  tenant_id: z.string().nullable(),
  occurred_at: z.string(),
  metadata: z.record(z.unknown()).nullable(),
});

export const rawPaginatedAuditSchema = z.object({
  items: z.array(rawAuditEventSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawAuditEvent = z.infer<typeof rawAuditEventSchema>;
export type RawPaginatedAudit = z.infer<typeof rawPaginatedAuditSchema>;
