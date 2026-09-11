import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onReset?: () => void;
  className?: string;
};

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  children,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <div className="relative w-full sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label={searchPlaceholder ?? "Search"}
        />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {children}
        {onReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
            <X /> Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
