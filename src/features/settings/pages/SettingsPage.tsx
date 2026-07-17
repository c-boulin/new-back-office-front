import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { getTenantSettings, updateTenantSettings } from "@/features/settings/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { TenantSettings } from "@/features/settings/types";

export function SettingsPage() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tenant", tenantId, "settings"],
    queryFn: getTenantSettings,
    enabled: Boolean(tenantId),
  });

  const [form, setForm] = useState<TenantSettings | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const saveMut = useMutation({
    mutationFn: (patch: Partial<TenantSettings>) => updateTenantSettings(patch),
    onSuccess: (next) => {
      toast.success(t("toast.saved"));
      queryClient.setQueryData(["tenant", tenantId, "settings"], next);
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <LoadingState />
      </div>
    );
  }
  if (query.isError || !form) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <ErrorState onRetry={() => void query.refetch()} />
      </div>
    );
  }

  const setField = <K extends keyof TenantSettings>(key: K, value: TenantSettings[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };
  const setFlag = (name: string, value: boolean) => {
    setForm((prev) =>
      prev ? { ...prev, featureFlags: { ...prev.featureFlags, [name]: value } } : prev,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.general")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">{t("fields.tenantName")}</Label>
              <Input
                id="tenant-name"
                value={form.tenantName}
                onChange={(e) => setField("tenantName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">{t("fields.supportEmail")}</Label>
              <Input
                id="support-email"
                type="email"
                value={form.supportEmail}
                onChange={(e) => setField("supportEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("fields.timezone")}</Label>
              <Input
                id="timezone"
                value={form.timezone}
                onChange={(e) => setField("timezone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">{t("fields.locale")}</Label>
              <Input
                id="locale"
                value={form.locale}
                onChange={(e) => setField("locale", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.brand")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand-primary">{t("fields.brandPrimary")}</Label>
            <Input
              id="brand-primary"
              value={form.brandPrimary}
              onChange={(e) => setField("brandPrimary", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-accent">{t("fields.brandAccent")}</Label>
            <Input
              id="brand-accent"
              value={form.brandAccent}
              onChange={(e) => setField("brandAccent", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.features")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(form.featureFlags).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between">
              <Label htmlFor={`flag-${name}`}>{t(`features.${name}`, { defaultValue: name })}</Label>
              <Switch
                id={`flag-${name}`}
                checked={value}
                onCheckedChange={(v) => setFlag(name, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <PermissionGate require={PERMISSIONS.SETTINGS_WRITE}>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => query.data && setForm(query.data)}
            disabled={saveMut.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>
            {t("actions.save")}
          </Button>
        </div>
      </PermissionGate>
    </div>
  );
}
