import { describe, it, expect } from "vitest";
import { moderationItemSchema } from "@/features/moderation/schemas";

const valid = {
  id: "m1",
  type: "profile",
  status: "pending",
  reason: "spam",
  reported_by: null,
  subject_name: "alice",
  subject_id: "u1",
  content: "hey",
  content_html: null,
  image_url: null,
  severity: "medium",
  created_at: "2024-01-01",
};

describe("moderationItemSchema", () => {
  it("parses valid item", () => {
    expect(() => moderationItemSchema.parse(valid)).not.toThrow();
  });

  it("rejects unknown severity", () => {
    expect(() => moderationItemSchema.parse({ ...valid, severity: "critical" })).toThrow();
  });

  it("rejects unknown type", () => {
    expect(() => moderationItemSchema.parse({ ...valid, type: "audio" })).toThrow();
  });
});
