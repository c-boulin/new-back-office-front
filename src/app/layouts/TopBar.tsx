import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { TenantSwitcher } from "@/components/common/TenantSwitcher";
import { UserMenu } from "@/components/common/UserMenu";
import type { ReactNode } from "react";

export function TopBar({ mobileNav }: { mobileNav: ReactNode }) {
  const { t } = useTranslation("common");
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="py-6">{mobileNav}</div>
          </SheetContent>
        </Sheet>
        <TenantSwitcher />
      </div>
      <div className="flex items-center gap-2">
        <a href="#main" className="skip-link">
          {t("skipToContent")}
        </a>
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
