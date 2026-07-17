import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import {
  resetStores,
  signInAs,
  activateTenant,
  membershipFixture,
  operatorFixture,
} from "@test/utils/fixtures";

describe("useActiveTenant", () => {
  beforeEach(() => resetStores());

  it("returns null tenant when nothing is activated", () => {
    const { result } = renderHook(() => useActiveTenant());
    expect(result.current.id).toBeNull();
    expect(result.current.slug).toBeNull();
    expect(result.current.membership).toBeUndefined();
  });

  it("returns the matching membership when tenant activated", () => {
    const membership = membershipFixture({
      tenantId: "t_luna",
      tenantSlug: "luna",
    });
    signInAs(operatorFixture, [membership]);
    activateTenant("t_luna", "luna");
    const { result } = renderHook(() => useActiveTenant());
    expect(result.current.id).toBe("t_luna");
    expect(result.current.slug).toBe("luna");
    expect(result.current.membership).toEqual(membership);
  });
});
