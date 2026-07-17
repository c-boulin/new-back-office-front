import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
              aria-label={t("nav.openMenu")}
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("nav.mobileTitle")}</SheetTitle>
              <SheetDescription>{t("nav.mobileDescription")}</SheetDescription>
            </SheetHeader>
            <div className="py-6">{mobileNav}</div>
          </SheetContent>
        </Sheet>
        <TenantSwitcher />
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
