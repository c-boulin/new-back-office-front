import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes with the last one winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignores falsy inputs", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("supports conditional objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});
