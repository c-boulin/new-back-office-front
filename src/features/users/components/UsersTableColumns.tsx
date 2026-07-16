import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRecord, UserStatus } from "@/features/users/types";

type Translations = {
  user: string;
  status: string;
  reports: string;
  matches: string;
  joined: string;
  lastActive: string;
  actions: string;
  view: string;
  statuses: Record<UserStatus, string>;
};

const STATUS_VARIANT: Record<UserStatus, "default" | "secondary" | "destructive" | "warning" | "success"> = {
  active: "success",
  banned: "destructive",
  shadow_banned: "warning",
  unverified: "secondary",
  deleted: "secondary",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UsersTableColumns({
  onView,
  translations,
}: {
  onView: (user: UserRecord) => void;
  translations: Translations;
}): ColumnDef<UserRecord, unknown>[] {
  return [
    {
      id: "user",
      header: translations.user,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
              <AvatarFallback>{initials(u.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{u.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: translations.status,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {translations.statuses[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "reports",
      header: translations.reports,
      cell: ({ row }) => (
        <span className={row.original.reportCount > 0 ? "font-medium text-destructive" : ""}>
          {row.original.reportCount}
        </span>
      ),
    },
    {
      id: "matches",
      header: translations.matches,
      accessorFn: (r) => r.matchesCount,
    },
    {
      id: "joined",
      header: translations.joined,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "lastActive",
      header: translations.lastActive,
      cell: ({ row }) =>
        row.original.lastActiveAt
          ? new Date(row.original.lastActiveAt).toLocaleDateString()
          : "—",
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => onView(row.original)}>
          <Eye />
          {translations.view}
        </Button>
      ),
    },
  ];
}
