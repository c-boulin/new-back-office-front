import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { FeatureFlag } from "../types";

type FeatureFlagsPanelProps = {
  flags: FeatureFlag[];
  onToggle: (key: string, enabled: boolean) => void;
  isPending: boolean;
};

export function FeatureFlagsPanel({
  flags,
  onToggle,
  isPending,
}: FeatureFlagsPanelProps) {
  const { t } = useTranslation("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("flags.title")}</CardTitle>
        <CardDescription>{t("flags.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <Label className="text-base font-medium">{flag.label}</Label>
              <p className="text-sm text-muted-foreground">
                {flag.description}
              </p>
            </div>
            <PermissionGate
              require={PERMISSIONS.FLAGS_WRITE}
              fallback={
                <Switch
                  checked={flag.enabled}
                  disabled
                  aria-label={flag.label}
                />
              }
            >
              <Switch
                checked={flag.enabled}
                disabled={isPending}
                onCheckedChange={(checked) => onToggle(flag.key, checked)}
                aria-label={flag.label}
              />
            </PermissionGate>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
