import type { ReactNode } from "react";

export function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </p>
      {children}
    </div>
  );
}
