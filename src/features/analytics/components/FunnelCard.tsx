import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStep } from "../types";

export type FunnelCardProps = {
  steps: FunnelStep[];
};

export function FunnelCard({ steps }: FunnelCardProps) {
  const { t } = useTranslation("analytics");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("funnel.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{step.name}</span>
              <span className="text-muted-foreground">
                {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${step.percentage}%`,
                  opacity: 1 - i * 0.15,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
