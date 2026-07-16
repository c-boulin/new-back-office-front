export type ReportReason = "harassment" | "spam" | "fake_profile" | "inappropriate_content" | "underage" | "scam" | "other";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export type Report = {
  id: string;
  reporterName: string;
  reporterId: string;
  targetName: string;
  targetId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedBy: string | null;
};

export type PaginatedReports = {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReportsQuery = {
  status?: ReportStatus | "all";
  reason?: ReportReason | "all";
  search?: string;
  page: number;
  pageSize: number;
};
