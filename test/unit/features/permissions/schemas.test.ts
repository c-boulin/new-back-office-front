import { describe, it, expect } from "vitest";
import { roleSchema, rolesResponseSchema } from "@/features/permissions/schemas";

const validRole = {
  id: "r1",
  label: "Moderator",
  color: "info",
  isLocked: false,
  permissions: { users: { read: true, update: false } },
  createdAt: "2024-01-01T00:00:00Z",
};

describe("roleSchema", () => {
  it("accepts a well-formed role", () => {
    expect(roleSchema.safeParse(validRole).success).toBe(true);
  });

  it("accepts a null createdAt", () => {
    expect(roleSchema.safeParse({ ...validRole, createdAt: null }).success).toBe(true);
  });

  it("rejects an unknown color", () => {
    expect(roleSchema.safeParse({ ...validRole, color: "teal" }).success).toBe(false);
  });

  it("rejects a missing isLocked flag", () => {
    const { isLocked, ...rest } = validRole;
    void isLocked;
    expect(roleSchema.safeParse(rest).success).toBe(false);
  });
});

describe("rolesResponseSchema", () => {
  it("parses a wrapped list", () => {
    const parsed = rolesResponseSchema.safeParse({ data: [validRole] });
    expect(parsed.success).toBe(true);
  });

  it("parses a bare array", () => {
    expect(rolesResponseSchema.safeParse([validRole]).success).toBe(true);
  });

  it("rejects a malformed role in the array", () => {
    expect(rolesResponseSchema.safeParse([{ ...validRole, color: "teal" }]).success).toBe(
      false,
    );
  });
});
