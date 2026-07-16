import { Check, X, TriangleAlert as AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { ModerationItem } from "../types";

type StatusVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

const STATUS_VARIANT: Record<string, StatusVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  escalated: "secondary",
};

const TYPE_VARIANT: Record<string, StatusVariant> = {
  photo: "outline",
  bio: "outline",
  message: "outline",
  profile: "outline",
};

export type ModerationItemCardProps = {
  item: ModerationItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEscalate: (id: string) => void;
};

export function ModerationItemCard({
  item,
  onApprove,
  onReject,
  onEscalate,
}: ModerationItemCardProps) {
  const { t } = useTranslation("moderation");

  const initial = item.userDisplayName.charAt(0).toUpperCase();
  const truncatedContent =
    item.content.length > 120 ? `${item.content.slice(0, 120)}…` : item.content;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      {/* Header: Avatar + User + Type */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.userDisplayName}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant={TYPE_VARIANT[item.type] ?? "outline"} className="text-xs">
              {t(`types.${item.type}`)}
            </Badge>
            <Badge variant={STATUS_VARIANT[item.status] ?? "secondary"} className="text-xs">
              {t(`statuses.${item.status}`)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content preview */}
      <p className="text-sm text-foreground">{truncatedContent}</p>

      {/* Reason */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">{t("columns.reason")}:</span> {item.reason}
      </p>

      {/* Actions — placed at the bottom for thumb reachability on mobile */}
      <PermissionGate require={PERMISSIONS.MODERATION_ACT}>
        <div className="mt-1 flex items-center gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onApprove(item.id)}
          >
            <Check className="mr-1 h-4 w-4" />
            {t("actions.approve")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onReject(item.id)}
          >
            <X className="mr-1 h-4 w-4" />
            {t("actions.reject")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => onEscalate(item.id)}
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            {t("actions.escalate")}
          </Button>
        </div>
      </PermissionGate>
    </div>
  );
}
