import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Check, Flag, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { EmptyState } from "@/components/common/EmptyState";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { ModerationItem } from "@/features/moderation/types";

export function ModerationDetailPane({
  item,
  onApprove,
  onReject,
  onEscalate,
}: {
  item: ModerationItem | null;
  onApprove: (item: ModerationItem) => void;
  onReject: (item: ModerationItem) => void;
  onEscalate: (item: ModerationItem) => void;
}) {
  const { t } = useTranslation("moderation");

  if (!item) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border bg-card/50 p-6">
        <EmptyState
          icon={ShieldAlert}
          title={t("detail.emptyTitle")}
          description={t("detail.emptyDescription")}
        />
      </div>
    );
  }

  const preview = item.contentPreview ?? item.content ?? item.reason;
  const aiDecisionKey =
    item.aiDecision === "accepted"
      ? "aiDecision.accepted"
      : item.aiDecision === "refused"
        ? "aiDecision.refused"
        : "aiDecision.unknown";

  return (
    <div className="flex h-full min-h-[420px] flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t(`types.${item.contentKind === "profile_photo" ? "profilePhoto" : item.contentKind}`)}
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold text-foreground">
            {sanitizeText(item.subjectName)}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{t(`statuses.${item.status}`)}</Badge>
          <Badge variant="secondary" className="text-[10px]">
            {t(aiDecisionKey)}
          </Badge>
        </div>
      </header>

      <section>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("detail.sectionContent")}
        </h4>
        <div className="mt-2 rounded-xl border bg-muted/40 p-4">
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            {sanitizeText(preview)}
          </p>
        </div>
      </section>

      <section className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("detail.reportedAt")}
          </p>
          <p className="mt-1 text-foreground">
            {format(new Date(item.createdAt), "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("columns.reason")}
          </p>
          <p className="mt-1 text-foreground">{sanitizeText(item.reason)}</p>
        </div>
      </section>

      {item.status === "pending" ? (
        <PermissionGate require={PERMISSIONS.MODERATION_ACT}>
          <footer className="mt-auto flex flex-wrap items-center gap-2 border-t pt-4">
            <Button onClick={() => onApprove(item)} className="gap-1.5">
              <Check className="h-4 w-4" aria-hidden />
              {t("actions.approve")}
            </Button>
            <Button variant="outline" onClick={() => onEscalate(item)} className="gap-1.5">
              <Flag className="h-4 w-4" aria-hidden />
              {t("actions.escalate")}
            </Button>
            <Button variant="destructive" onClick={() => onReject(item)} className="gap-1.5">
              <X className="h-4 w-4" aria-hidden />
              {t("actions.reject")}
            </Button>
          </footer>
        </PermissionGate>
      ) : null}
    </div>
  );
}
