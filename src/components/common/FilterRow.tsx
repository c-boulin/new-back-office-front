import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type FilterRowProps = {
  children: ReactNode;
  onReset?: () => void;
  className?: string;
};

export function FilterRow({ children, onReset, className }: FilterRowProps) {
  const { t } = useTranslation("common");
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap", className)}>
      {children}
      {onReset ? (
        <Button variant="ghost" size="sm" onClick={onReset} className="sm:ml-auto">
          <X />
          {t("actions.reset")}
        </Button>
      ) : null}
    </div>
  );
}
