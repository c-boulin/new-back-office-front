export type AuditAction =
  | "user.ban"
  | "user.unban"
  | "user.verify"
  | "moderation.approve"
  | "moderation.reject"
  | "moderation.escalate"
  | "report.resolve"
  | "report.dismiss"
  | "report.investigate"
  | "subscription.refund"
  | "subscription.cancel"
  | "settings.update"
  | "flag.toggle"
  | "tenant.create"
  | "tenant.update"
  | "admin.invite"
  | "admin.remove";

export type AuditEvent = {
  id: string;
  actorName: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityLabel: string;
  tenantId: string | null;
  occurredAt: string;
  metadata: Record<string, unknown> | null;
};

export type PaginatedAuditEvents = {
  items: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
};

export type AuditQuery = {
  action?: AuditAction | "all";
  actorId?: string;
  search?: string;
  page: number;
  pageSize: number;
};
