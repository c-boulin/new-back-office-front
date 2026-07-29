import { describe, it, expect } from "vitest";
import { roleFromRaw, rolesFromRaw } from "@/features/permissions/adaptors";
import type { RawRole } from "@/features/permissions/schemas";

const raw: RawRole = {
  id: "r1",
  label: "  Moderator  ",
  color: "info",
  isLocked: false,
  permissions: { users: { read: true }, unknownSection: { read: true } },
  createdAt: "2024-01-01T00:00:00Z",
};

describe("roleFromRaw", () => {
  it("sanitizes and trims the label", () => {
    expect(roleFromRaw({ ...raw, label: "<b>Moderator</b>" }).label).toBe("Moderator");
  });

  it("preserves granted permissions from the source", () => {
    expect(roleFromRaw(raw).permissions.users.read).toBe(true);
  });

  it("defaults missing catalog cells to false", () => {
    const role = roleFromRaw(raw);
    expect(role.permissions.users.update).toBe(false);
    expect(role.permissions.dashboard.read).toBe(false);
  });

  it("drops sections that are not part of the catalog", () => {
    expect(roleFromRaw(raw).permissions.unknownSection).toBeUndefined();
  });

  it("passes a null createdAt through", () => {
    expect(roleFromRaw({ ...raw, createdAt: null }).createdAt).toBeNull();
  });
});

describe("rolesFromRaw", () => {
  it("maps the wrapped data array", () => {
    const roles = rolesFromRaw({ data: [raw] });
    expect(roles).toHaveLength(1);
    expect(roles[0].label).toBe("Moderator");
  });
});
