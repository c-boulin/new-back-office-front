import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import i18n from "@/lib/i18n";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("LanguageSwitcher", () => {
  it("shows the current language code", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: /change language/i })).toHaveTextContent(/en/i);
  });

  it("changes language when a menu item is selected", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: /change language/i }));
    const french = await screen.findByRole("menuitem", { name: /français/i });
    await userEvent.click(french);
    expect(i18n.resolvedLanguage).toBe("fr");
    await i18n.changeLanguage("en");
  });
});
