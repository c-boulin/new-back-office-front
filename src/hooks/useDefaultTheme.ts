import { useEffect } from "react";
import { resetTenantTheme } from "@/lib/tenantTheme";

/**
 * Restores the neutral base theme by clearing tenant CSS variables on mount.
 * Use on pages rendered outside a `RequireTenant` scope so a previously-active
 * tenant theme cannot leak into the chooser, access-denied, or auth surfaces.
 */
export function useDefaultTheme(): void {
  useEffect(() => {
    resetTenantTheme();
  }, []);
}
