import { describe, it, expect } from "vitest";
import {
  platformAdminFromRaw,
  platformAdminListFromRaw,
} from "@/features/superAdmin/adaptors";
import { platformAdminSchema } from "@/features/superAdmin/schemas";

const raw = {
  id: "pa1",
  name: " Alice ",
  email: "alice@example.com",
  role: "admin" as const,
  last_active_at: null,
  created_at: "2024-01-01",
};

describe("platformAdminFromRaw", () => {
  it("sanitizes name and renames fields", () => {
    const out = platformAdminFromRaw(raw);
    expect(out.name).toBe("Alice");
    expect(out.lastActiveAt).toBeNull();
    expect(out.createdAt).toBe("2024-01-01");
  });
});

describe("platformAdminListFromRaw", () => {
  it("maps each item", () => {
    const out = platformAdminListFromRaw({ items: [raw], total: 1 });
    expect(out).toHaveLength(1);
  });
});

describe("platformAdminSchema", () => {
  it("rejects unknown role", () => {
    expect(() => platformAdminSchema.parse({ ...raw, role: "hero" })).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => platformAdminSchema.parse({ ...raw, email: "bad" })).toThrow();
  });
});
