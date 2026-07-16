import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
};

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  return (
    <nav className="space-y-1 px-3" aria-label="Primary navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <item.icon className="h-4 w-4" aria-hidden />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
