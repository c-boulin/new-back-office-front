import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
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

const formSchema = z.object({
  tenantName: z.string().min(1),
  supportEmail: z.string().email(),
  timezone: z.string().min(1),
  locale: z.string().min(1),
  brandPrimary: z.string().min(1),
  brandAccent: z.string().min(1),
  featureFlags: z.record(z.string(), z.boolean()),
});

export function SettingsForm() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "settings"],
    queryFn: getTenantSettings,
  });

  const form = useForm<TenantSettings>({
    resolver: zodResolver(formSchema),
    values: data,
    defaultValues: data,
  });

  const flags = form.watch("featureFlags");

  const saveMutation = useMutation({
    mutationFn: (patch: TenantSettings) => updateTenantSettings(patch),
    onSuccess: (next) => {
      toast.success(t("toast.saved"));
      queryClient.setQueryData(["tenant", tenantId, "settings"], next);
      form.reset(next);
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  const onSubmit = form.handleSubmit((values) => saveMutation.mutate(values));

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.general")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">{t("fields.tenantName")}</Label>
              <Input id="tenant-name" {...form.register("tenantName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">{t("fields.supportEmail")}</Label>
              <Input id="support-email" type="email" {...form.register("supportEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("fields.timezone")}</Label>
              <Input id="timezone" {...form.register("timezone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locale">{t("fields.locale")}</Label>
              <Input id="locale" {...form.register("locale")} />
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
            <Input id="brand-primary" {...form.register("brandPrimary")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-accent">{t("fields.brandAccent")}</Label>
            <Input id="brand-accent" {...form.register("brandAccent")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.features")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(flags ?? {}).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between">
              <Label htmlFor={`flag-${name}`}>
                {t(`features.${name}`, { defaultValue: name })}
              </Label>
              <Switch
                id={`flag-${name}`}
                checked={value}
                onCheckedChange={(next) =>
                  form.setValue(
                    "featureFlags",
                    { ...form.getValues("featureFlags"), [name]: next },
                    { shouldDirty: true },
                  )
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <PermissionGate require={PERMISSIONS.PRODUCT_CONFIG_UPDATE}>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(data)}
            disabled={saveMutation.isPending || !form.formState.isDirty}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || !form.formState.isDirty}
          >
            {t("actions.save")}
          </Button>
        </div>
      </PermissionGate>
    </form>
  );
}
