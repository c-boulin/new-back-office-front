import { describe, it, expect } from "vitest";
import { reportSchema } from "@/features/reports/schemas";

const valid = {
  id: "r1",
  reporter_name: "bob",
  reporter_id: "u1",
  subject_name: "alice",
  subject_id: "u2",
  category: "spam",
  status: "open",
  description: "spammer",
  created_at: "2024-01-01",
  resolved_at: null,
  resolver_name: null,
};

describe("reportSchema", () => {
  it("parses valid", () => {
    expect(() => reportSchema.parse(valid)).not.toThrow();
  });

  it("rejects unknown category", () => {
    expect(() => reportSchema.parse({ ...valid, category: "bug" })).toThrow();
  });

  it("rejects unknown status", () => {
    expect(() => reportSchema.parse({ ...valid, status: "pending" })).toThrow();
  });
});
