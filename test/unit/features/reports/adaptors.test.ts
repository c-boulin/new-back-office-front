import { describe, it, expect } from "vitest";
import { reportFromRaw, paginatedReportsFromRaw } from "@/features/reports/adaptors";
import type { RawReport } from "@/features/reports/schemas";

const raw: RawReport = {
  id: "r1",
  reporter_name: " bob ",
  reporter_id: "u1",
  subject_name: " alice ",
  subject_id: "u2",
  category: "spam",
  status: "open",
  description: " spamming ",
  created_at: "2024-01-01",
  resolved_at: null,
  resolver_name: null,
};

describe("reportFromRaw", () => {
  it("converts fields and sanitizes strings", () => {
    const out = reportFromRaw(raw);
    expect(out.reporterName).toBe("bob");
    expect(out.subjectName).toBe("alice");
    expect(out.description).toBe("spamming");
    expect(out.resolverName).toBeNull();
    expect(out.resolvedAt).toBeNull();
  });

  it("sanitizes resolver name when present", () => {
    const out = reportFromRaw({ ...raw, resolver_name: " ops " });
    expect(out.resolverName).toBe("ops");
  });
});

describe("paginatedReportsFromRaw", () => {
  it("maps a page", () => {
    const out = paginatedReportsFromRaw({
      items: [raw],
      total: 1,
      page: 0,
      page_size: 10,
    });
    expect(out.pageSize).toBe(10);
    expect(out.items).toHaveLength(1);
  });
});
