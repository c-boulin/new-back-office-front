import { describe, it, expect } from "vitest";
import { buildPermissionMatrix } from "@/features/permissions/matrix";
import { BACKOFFICE_SECTIONS } from "@/features/permissions/types";

describe("buildPermissionMatrix", () => {
  it("covers every catalog section and action", () => {
    const matrix = buildPermissionMatrix();
    for (const [section, actions] of Object.entries(BACKOFFICE_SECTIONS)) {
      expect(Object.keys(matrix[section]).sort()).toEqual([...actions].sort());
    }
  });

  it("defaults all cells to false when no source is given", () => {
    const matrix = buildPermissionMatrix();
    const values = Object.values(matrix).flatMap((row) => Object.values(row));
    expect(values.every((v) => v === false)).toBe(true);
  });

  it("keeps only cells explicitly set to true", () => {
    const matrix = buildPermissionMatrix({ users: { read: true, update: false } });
    expect(matrix.users.read).toBe(true);
    expect(matrix.users.update).toBe(false);
    expect(matrix.users.delete).toBe(false);
  });

  it("ignores keys outside the catalog", () => {
    const matrix = buildPermissionMatrix({
      users: { unknownAction: true },
      unknownSection: { read: true },
    });
    expect(matrix.unknownSection).toBeUndefined();
    expect(matrix.users).not.toHaveProperty("unknownAction");
    expect(matrix.users.read).toBe(false);
  });
});
