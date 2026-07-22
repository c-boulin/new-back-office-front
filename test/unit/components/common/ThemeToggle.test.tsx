import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useUiStore } from "@/stores/uiStore";

function renderToggle() {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeToggle />
    </I18nextProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    useUiStore.setState({ colorScheme: "light" });
  });

  it("switches to dark when clicked from light", async () => {
    renderToggle();
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", expect.stringMatching(/dark/i));
    await userEvent.click(button);
    expect(useUiStore.getState().colorScheme).toBe("dark");
  });

  it("switches to light when clicked from dark", async () => {
    useUiStore.setState({ colorScheme: "dark" });
    renderToggle();
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", expect.stringMatching(/light/i));
    await userEvent.click(button);
    expect(useUiStore.getState().colorScheme).toBe("light");
  });
});
