import { ChevronsUpDown, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { applyTenantTheme } from "@/lib/tenantTheme";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { productColors } from "@/features/auth/products";

export function SidebarProductCard() {
  const { t } = useTranslation("common");
  const memberships = useAuthStore((s) => s.memberships);
  const activeId = useTenantStore((s) => s.activeTenantId);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const active = memberships.find((m) => m.tenantId === activeId);
  const activeColors = active
    ? productColors(active.tenantId, active.tenantSlug)
    : null;

  const gradient = activeColors
    ? `linear-gradient(135deg, hsl(${activeColors.hue}) 0%, hsl(${activeColors.accent}) 100%)`
    : `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)`;

  if (!active) return null;

  const canSwitch = memberships.length > 1;

  const onSelect = (tenantId: string) => {
    const next = memberships.find((m) => m.tenantId === tenantId);
    if (!next || next.tenantId === activeId) {
      setOpen(false);
      return;
    }
    if (activeId) {
      queryClient.removeQueries({ queryKey: ["tenant", activeId] });
    }
    setActiveTenant({ id: next.tenantId, slug: next.tenantSlug, theme: next.theme });
    applyTenantTheme(next.theme);
    setOpen(false);
    navigate(`/t/${next.tenantSlug}`);
  };

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors",
        canSwitch ? "hover:bg-muted/50" : "cursor-default",
      )}
      disabled={!canSwitch}
      aria-label={t("productCard.switch")}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
        style={{ background: gradient }}
      >
        <Heart className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
          {t("productCard.label")}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">{active.tenantName}</p>
      </div>
      {canSwitch ? <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
    </button>
  );

  if (!canSwitch) return trigger;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={t("productCard.search")} />
          <CommandList>
            <CommandEmpty>{t("productCard.empty")}</CommandEmpty>
            <CommandGroup>
              {memberships.map((m) => {
                const itemHue = productColors(m.tenantId, m.tenantSlug).hue;
                return (
                  <CommandItem
                    key={m.tenantId}
                    value={m.tenantName}
                    onSelect={() => onSelect(m.tenantId)}
                    className="gap-2"
                  >
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `hsl(${itemHue})` }}
                    />
                    <span className="truncate">{m.tenantName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
