import type { RawRoleColor } from "../schemas";

export const ROLE_COLOR_CLASSES: Record<RawRoleColor, string> = {
  error: "bg-destructive/15 text-destructive ring-destructive/40",
  warning: "bg-warning/20 text-warning-foreground ring-warning/40",
  info: "bg-sky-500/15 text-sky-600 ring-sky-500/40 dark:text-sky-300",
  success: "bg-success/15 text-success-foreground ring-success/40",
  primary: "bg-primary/15 text-primary ring-primary/40",
  secondary: "bg-muted text-foreground ring-border",
};

export const ROLE_COLOR_DOT: Record<RawRoleColor, string> = {
  error: "bg-destructive",
  warning: "bg-warning",
  info: "bg-sky-500",
  success: "bg-success",
  primary: "bg-primary",
  secondary: "bg-muted-foreground",
};
