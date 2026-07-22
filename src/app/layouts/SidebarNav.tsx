import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  badge?: string | number;
};

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  return (
    <nav className="space-y-0.5" aria-label="Primary navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 font-medium text-primary"
                : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full transition-opacity",
                  isActive ? "bg-primary opacity-100" : "opacity-0",
                )}
              />
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge != null ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {item.badge}
                </span>
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
