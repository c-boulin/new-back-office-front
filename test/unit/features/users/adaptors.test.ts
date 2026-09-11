import { describe, it, expect } from "vitest";
import { userFromRaw, paginatedUsersFromRaw } from "@/features/users/adaptors";
import type { RawUserRecord } from "@/features/users/schemas";

const raw: RawUserRecord = {
  id: "u1",
  display_name: "  Alice  ",
  email: "alice@example.com",
  avatar_url: null,
  status: "active",
  is_verified: true,
  is_premium: false,
  report_count: 0,
  matches_count: 12,
  created_at: "2024-01-01T00:00:00Z",
  last_active_at: "2024-06-01T00:00:00Z",
  city: "<b>Paris</b>",
  country: "France",
};

describe("userFromRaw", () => {
  it("converts snake_case to camelCase", () => {
    const out = userFromRaw(raw);
    expect(out.displayName).toBe("Alice");
    expect(out.avatarUrl).toBeNull();
    expect(out.isVerified).toBe(true);
    expect(out.isPremium).toBe(false);
    expect(out.reportCount).toBe(0);
    expect(out.matchesCount).toBe(12);
    expect(out.lastActiveAt).toBe("2024-06-01T00:00:00Z");
  });

  it("sanitizes strings", () => {
    const out = userFromRaw({ ...raw, display_name: "<script>x</script>Alice" });
    expect(out.displayName).toBe("Alice");
  });

  it("passes null city/country through untouched", () => {
    const out = userFromRaw({ ...raw, city: null, country: null });
    expect(out.city).toBeNull();
    expect(out.country).toBeNull();
  });
});

describe("paginatedUsersFromRaw", () => {
  it("maps items and renames page_size", () => {
    const out = paginatedUsersFromRaw({
      items: [raw],
      total: 1,
      page: 0,
      page_size: 20,
    });
    expect(out.total).toBe(1);
    expect(out.page).toBe(0);
    expect(out.pageSize).toBe(20);
    expect(out.items[0].displayName).toBe("Alice");
  });
});
