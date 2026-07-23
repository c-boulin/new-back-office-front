import { cn } from "@/lib/utils";
import type { RawRoleColor } from "../schemas";
import { ROLE_COLOR_DOT } from "./roleColorTokens";

export function RoleColorSwatch({
  color,
  className,
}: {
  color: RawRoleColor;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-2.5 w-2.5 rounded-full", ROLE_COLOR_DOT[color], className)}
    />
  );
}
