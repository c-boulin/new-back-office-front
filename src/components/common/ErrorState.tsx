import { TriangleAlert as AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation("common");
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium">{title ?? t("errors.title")}</p>
        <p className="text-sm text-muted-foreground">
          {description ?? t("errors.description")}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw />
          {t("actions.retry")}
        </Button>
      ) : null}
    </div>
  );
}
