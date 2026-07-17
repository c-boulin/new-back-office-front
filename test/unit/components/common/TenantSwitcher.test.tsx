import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TenantSwitcher } from "@/components/common/TenantSwitcher";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores, membershipFixture } from "@test/utils/fixtures";

describe("TenantSwitcher", () => {
  beforeEach(() => {
    resetStores();
  });

  it("renders nothing when the user has zero or one membership", () => {
    useAuthStore.setState({ memberships: [membershipFixture()] });
    const { container } = renderWithProviders(<TenantSwitcher />);
    expect(container.firstChild).toBeNull();
  });

  it("shows active tenant name and switches on selection", async () => {
    const a = membershipFixture({ tenantId: "t_a", tenantSlug: "a", tenantName: "Alpha" });
    const b = membershipFixture({ tenantId: "t_b", tenantSlug: "b", tenantName: "Bravo" });
    useAuthStore.setState({ memberships: [a, b] });
    useTenantStore.setState({
      activeTenantId: "t_a",
      activeTenantSlug: "a",
      activeTheme: null,
    });

    renderWithProviders(<TenantSwitcher />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Alpha");
    await userEvent.click(trigger);
    const bravo = await screen.findByRole("option", { name: /bravo/i });
    await userEvent.click(bravo);
    expect(useTenantStore.getState().activeTenantId).toBe("t_b");
    expect(useTenantStore.getState().activeTenantSlug).toBe("b");
  });
});
