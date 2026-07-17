import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("ConfirmDialog", () => {
  it("shows title and description", () => {
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Ban this user?"
        description="Immediate revoke."
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Ban this user?")).toBeInTheDocument();
    expect(screen.getByText("Immediate revoke.")).toBeInTheDocument();
  });

  it("keeps confirm disabled until typed value matches", async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Ban"
        description="Type the confirmation phrase to proceed."
        typedConfirmationValue="BAN"
        onConfirm={onConfirm}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /^confirm$/i });
    expect(confirmBtn).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "BAN");
    expect(confirmBtn).not.toBeDisabled();
    await userEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("disables cancel and confirm while loading", () => {
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="X"
        description="Y"
        loading
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeDisabled();
  });

  it("cancel invokes onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="X"
        description="Y"
        onConfirm={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
