import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";
import { applyTenantTheme } from "@/lib/tenantTheme";
import { useTenantStore } from "@/stores/tenantStore";

/**
 * Applies tenant theme CSS variables and reacts to color scheme changes.
 * Uses a listener effect (allowed exception) for prefers-color-scheme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useUiStore((s) => s.colorScheme);
  const theme = useTenantStore((s) => s.activeTheme);

  useEffect(() => {
    applyTenantTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = colorScheme === "dark" || (colorScheme === "system" && mql.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [colorScheme]);

  return <>{children}</>;
}
