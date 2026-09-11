import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  activateTenant,
  membershipFixture,
  operatorFixture,
  superAdminFixture,
} from "@test/utils/fixtures";

describe("PermissionGate", () => {
  beforeEach(() => resetStores());

  it("renders children when the permission is granted", () => {
    signInAs(operatorFixture, [
      membershipFixture({ permissions: [PERMISSIONS.USERS_MODERATE] }),
    ]);
    activateTenant("t_luna", "luna");
    renderWithProviders(
      <PermissionGate require={PERMISSIONS.USERS_MODERATE}>
        <button>Ban</button>
      </PermissionGate>,
    );
    expect(screen.getByRole("button", { name: "Ban" })).toBeInTheDocument();
  });

  it("renders fallback when the permission is missing", () => {
    signInAs(operatorFixture, [
      membershipFixture({ permissions: [PERMISSIONS.USERS_READ] }),
    ]);
    activateTenant("t_luna", "luna");
    renderWithProviders(
      <PermissionGate require={PERMISSIONS.USERS_MODERATE} fallback={<span>Locked</span>}>
        <button>Ban</button>
      </PermissionGate>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });

  it("bypasses check for super-admins", () => {
    signInAs(superAdminFixture, []);
    renderWithProviders(
      <PermissionGate require={PERMISSIONS.SETTINGS_WRITE}>
        <button>Edit</button>
      </PermissionGate>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
