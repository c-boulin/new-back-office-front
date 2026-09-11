import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
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
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { UserMenu } from "@/components/common/UserMenu";

export function TopBar({ mobileNav, actions }: { mobileNav: ReactNode; actions?: ReactNode }) {
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
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("nav.mobileTitle")}</SheetTitle>
              <SheetDescription>{t("nav.mobileDescription")}</SheetDescription>
            </SheetHeader>
            {mobileNav}
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-1">
        {actions}
        <ThemeToggle />
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
