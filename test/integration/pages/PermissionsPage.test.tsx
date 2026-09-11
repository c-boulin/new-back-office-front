import { Suspense } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionsPage } from "@/features/permissions/pages/PermissionsPage";
import { renderWithProviders, makeTestQueryClient } from "@test/utils/renderWithProviders";
import {
  resetStores,
  activateTenant,
  signInAs,
  operatorFixture,
  superAdminFixture,
  membershipFixture,
} from "@test/utils/fixtures";
import { PERMISSIONS } from "@/lib/permissions";
import type { Role } from "@/features/permissions/types";

const TENANT_ID = "tnt_luna";
const TENANT_SLUG = "luna";

const seedRole: Role = {
  id: "role_1",
  label: "Moderator",
  color: "#3b82f6",
  isLocked: false,
  permissions: { dashboard: { read: true } },
  createdAt: "2024-01-01T00:00:00Z",
};

function makeSeededClient() {
  const qc = makeTestQueryClient();
  qc.setQueryData(["tenant", TENANT_ID, "roles"], [seedRole]);
  return qc;
}

describe("PermissionsPage — Create role button", () => {
  beforeEach(() => {
    resetStores();
  });

  function setupWithPermissions(permissions: string[]) {
    const membership = membershipFixture({
      tenantId: TENANT_ID,
      tenantSlug: TENANT_SLUG,
      permissions,
    });
    signInAs(operatorFixture, [membership]);
    activateTenant(TENANT_ID, TENANT_SLUG);
  }

  function renderPage(route: string) {
    return renderWithProviders(
      <Suspense fallback={<div>loading</div>}>
        <PermissionsPage />
      </Suspense>,
      { route, queryClient: makeSeededClient() },
    );
  }

  it("shows 'Create role' button on the roles tab for users with settings.create", () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_CREATE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const buttons = screen.getAllByRole("button", { name: /create role/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking the Create role button opens the role creation dialog", async () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_CREATE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button", { name: /create role/i });
    await user.click(buttons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("hides 'Create role' button on the roles tab when user lacks settings.create", () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_WRITE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const buttons = screen.queryAllByRole("button", { name: /create role/i });
    expect(buttons).toHaveLength(0);
  });

  it("super admin always sees the Create role button", () => {
    const membership = membershipFixture({
      tenantId: TENANT_ID,
      tenantSlug: TENANT_SLUG,
      permissions: [],
    });
    signInAs(superAdminFixture, [membership]);
    activateTenant(TENANT_ID, TENANT_SLUG);

    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const buttons = screen.getAllByRole("button", { name: /create role/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

describe("PermissionsPage — Inline role editing", () => {
  beforeEach(() => {
    resetStores();
  });

  function setupWithPermissions(permissions: string[]) {
    const membership = membershipFixture({
      tenantId: TENANT_ID,
      tenantSlug: TENANT_SLUG,
      permissions,
    });
    signInAs(operatorFixture, [membership]);
    activateTenant(TENANT_ID, TENANT_SLUG);
  }

  function renderPage(route: string) {
    return renderWithProviders(
      <Suspense fallback={<div>loading</div>}>
        <PermissionsPage />
      </Suspense>,
      { route, queryClient: makeSeededClient() },
    );
  }

  it("shows a rename button next to the role name for non-locked roles", () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_WRITE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    expect(screen.getByRole("button", { name: /rename role/i })).toBeInTheDocument();
  });

  it("clicking the rename button shows an input with the current role name", async () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_WRITE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /rename role/i }));

    const input = screen.getByRole("textbox", { name: /name/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Moderator");
  });

  it("shows a color picker badge that opens a popover on click", async () => {
    setupWithPermissions([PERMISSIONS.SETTINGS_WRITE]);
    renderPage(`/t/${TENANT_SLUG}/permissions?tab=roles`);

    const user = userEvent.setup();
    const badge = screen.getByRole("button", { name: /pick a color/i });
    expect(badge).toBeInTheDocument();

    await user.click(badge);
    expect(screen.getByLabelText("Hex color")).toBeInTheDocument();
  });
});
