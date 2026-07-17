export type ReportCategory =
  | "harassment"
  | "spam"
  | "impersonation"
  | "inappropriate_content"
  | "underage"
  | "other";

export type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";

export type Report = {
  id: string;
  reporterName: string;
  reporterId: string;
  subjectName: string;
  subjectId: string;
  category: ReportCategory;
  status: ReportStatus;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
  resolverName: string | null;
};

export type PaginatedReports = {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReportsQuery = {
  status?: ReportStatus | "all";
  category?: ReportCategory | "all";
  page: number;
  pageSize: number;
};
