import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/uiStore";

export type ThemeToggleProps = {
  className?: string;
};

function resolvedScheme(scheme: "light" | "dark" | "system"): "light" | "dark" {
  if (scheme === "system") {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return scheme;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation("common");
  const scheme = useUiStore((s) => s.colorScheme);
  const setColorScheme = useUiStore((s) => s.setColorScheme);
  const resolved = resolvedScheme(scheme);
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t(next === "dark" ? "themeToggle.switchToDark" : "themeToggle.switchToLight")}
      onClick={() => setColorScheme(next)}
      className={className}
    >
      {resolved === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
