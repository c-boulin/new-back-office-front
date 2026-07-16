import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { applyTenantTheme } from "@/lib/tenantTheme";
import { queryClient } from "@/lib/queryClient";

export function TenantSwitcher() {
  const memberships = useAuthStore((s) => s.memberships);
  const activeId = useTenantStore((s) => s.activeTenantId);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const navigate = useNavigate();
  const { t } = useTranslation("tenants");
  const [open, setOpen] = useState(false);

  if (memberships.length <= 1) return null;

  const active = memberships.find((m) => m.tenantId === activeId);

  const onSelect = (membershipId: string) => {
    const next = memberships.find((m) => m.tenantId === membershipId);
    if (!next) return;
    queryClient.removeQueries();
    setActiveTenant({ id: next.tenantId, slug: next.tenantSlug, theme: next.theme });
    applyTenantTheme(next.theme);
    setOpen(false);
    navigate(`/t/${next.tenantSlug}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-56 justify-between"
        >
          <span className="truncate">{active?.tenantName ?? t("switcher.placeholder")}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder={t("switcher.search")} />
          <CommandList>
            <CommandEmpty>{t("switcher.empty")}</CommandEmpty>
            <CommandGroup>
              {memberships.map((m) => (
                <CommandItem
                  key={m.tenantId}
                  value={m.tenantName}
                  onSelect={() => onSelect(m.tenantId)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      m.tenantId === activeId ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{m.tenantName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
