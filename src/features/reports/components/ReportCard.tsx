import { formatDistanceToNow } from "date-fns";
import { Flag, Eye, CircleCheck as CheckCircle, Circle as XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { Report, ReportStatus, ReportReason } from "../types";

export type ReportCardProps = {
  report: Report;
  onInvestigate: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  translations: {
    investigate: string;
    resolve: string;
    dismiss: string;
    reporter: string;
    target: string;
    statuses: Record<ReportStatus, string>;
    reasons: Record<ReportReason, string>;
  };
};

function statusVariant(status: ReportStatus) {
  switch (status) {
    case "open":
      return "default" as const;
    case "investigating":
      return "secondary" as const;
    case "resolved":
      return "outline" as const;
    case "dismissed":
      return "outline" as const;
  }
}

function statusClassName(status: ReportStatus) {
  if (status === "resolved") return "border-green-500 text-green-600";
  if (status === "dismissed") return "text-muted-foreground";
  return "";
}

export function ReportCard({
  report,
  onInvestigate,
  onResolve,
  onDismiss,
  translations: t,
}: ReportCardProps) {
  const isActionable = report.status === "open" || report.status === "investigating";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-sm font-semibold">{report.targetName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.reporter}: {report.reporterName}
            </p>
          </div>
          <Badge
            variant={statusVariant(report.status)}
            className={statusClassName(report.status)}
          >
            {t.statuses[report.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Badge variant="secondary" className="capitalize">
          {t.reasons[report.reason]}
        </Badge>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {report.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </p>
      </CardContent>

      {isActionable && (
        <CardFooter className="flex-wrap gap-2">
          <PermissionGate require={PERMISSIONS.REPORTS_RESOLVE}>
            {report.status === "open" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvestigate(report.id)}
              >
                <Eye />
                {t.investigate}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolve(report.id)}
            >
              <CheckCircle />
              {t.resolve}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(report.id)}
            >
              <XCircle />
              {t.dismiss}
            </Button>
          </PermissionGate>
        </CardFooter>
      )}
    </Card>
  );
}
