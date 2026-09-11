import { describe, it, expect } from "vitest";
import { userRecordSchema, paginatedUsersSchema } from "@/features/users/schemas";

const valid = {
  id: "u1",
  display_name: "Alice",
  email: "alice@example.com",
  avatar_url: null,
  status: "active",
  is_verified: true,
  is_premium: false,
  report_count: 0,
  matches_count: 12,
  created_at: "2024-01-01T00:00:00Z",
  last_active_at: null,
  city: null,
  country: null,
};

describe("userRecordSchema", () => {
  it("parses valid raw", () => {
    expect(() => userRecordSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      userRecordSchema.parse({ ...valid, email: "not-an-email" }),
    ).toThrow();
  });

  it("rejects unknown status", () => {
    expect(() => userRecordSchema.parse({ ...valid, status: "vip" })).toThrow();
  });

  it("rejects negative counts", () => {
    expect(() => userRecordSchema.parse({ ...valid, report_count: -1 })).toThrow();
  });
});

describe("paginatedUsersSchema", () => {
  it("parses a valid page", () => {
    expect(() =>
      paginatedUsersSchema.parse({ items: [valid], total: 1, page: 0, page_size: 20 }),
    ).not.toThrow();
  });

  it("rejects when page_size is not positive", () => {
    expect(() =>
      paginatedUsersSchema.parse({ items: [], total: 0, page: 0, page_size: 0 }),
    ).toThrow();
  });
});
