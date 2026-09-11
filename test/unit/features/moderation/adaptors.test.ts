import { describe, it, expect } from "vitest";
import {
  moderationItemFromRaw,
  paginatedModerationFromRaw,
} from "@/features/moderation/adaptors";
import type { RawModerationItem } from "@/features/moderation/schemas";

const raw: RawModerationItem = {
  id: "m1",
  type: "profile",
  status: "pending",
  reason: "  spam  ",
  reported_by: "  bob  ",
  subject_name: "  alice  ",
  subject_id: "u1",
  content: "  hey  ",
  content_html: "<b>hey</b><script>bad()</script>",
  image_url: null,
  severity: "medium",
  created_at: "2024-01-01",
};

describe("moderationItemFromRaw", () => {
  it("maps and sanitizes fields", () => {
    const out = moderationItemFromRaw(raw);
    expect(out.reason).toBe("spam");
    expect(out.reportedBy).toBe("bob");
    expect(out.subjectName).toBe("alice");
    expect(out.contentHtml).toContain("<b>hey</b>");
    expect(out.contentHtml).not.toContain("script");
  });

  it("preserves null reportedBy", () => {
    const out = moderationItemFromRaw({ ...raw, reported_by: null });
    expect(out.reportedBy).toBeNull();
  });
});

describe("paginatedModerationFromRaw", () => {
  it("renames page_size", () => {
    const out = paginatedModerationFromRaw({
      items: [raw],
      total: 1,
      page: 0,
      page_size: 20,
    });
    expect(out.pageSize).toBe(20);
    expect(out.items).toHaveLength(1);
  });
});
