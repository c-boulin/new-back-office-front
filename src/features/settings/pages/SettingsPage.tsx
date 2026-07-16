import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { PERMISSIONS } from "@/lib/permissions";
import { getSettings, updateSettings, toggleFeatureFlag } from "../api";
import { GeneralSettingsForm } from "../components/GeneralSettingsForm";
import { ModerationSettingsForm } from "../components/ModerationSettingsForm";
import { NotificationSettingsForm } from "../components/NotificationSettingsForm";
import { FeatureFlagsPanel } from "../components/FeatureFlagsPanel";
import type { GeneralSettingsValues } from "../components/GeneralSettingsForm";
import type { ModerationSettingsValues } from "../components/ModerationSettingsForm";
import type { NotificationSettingsValues } from "../components/NotificationSettingsForm";

export function SettingsPage() {
  const { t } = useTranslation("settings");
  const { id: tenantId } = useActiveTenant();
  const queryClient = useQueryClient();
  const isTablet = useMediaQuery("(min-width: 768px)");

  // ──── Queries ────
  const settingsQuery = useQuery({
    queryKey: ["tenant", tenantId, "settings"],
    queryFn: getSettings,
    enabled: Boolean(tenantId),
  });

  // ──── Mutations ────
  const invalidateSettings = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["tenant", tenantId, "settings"],
    });
  }, [queryClient, tenantId]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      invalidateSettings();
      toast.success(t("success"));
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      toggleFeatureFlag(key, enabled),
    onSuccess: () => {
      invalidateSettings();
      toast.success(t("success"));
    },
  });

  // ──── Handlers ────
  const handleGeneralSubmit = useCallback(
    (values: GeneralSettingsValues) => {
      updateMutation.mutate({ general: values });
    },
    [updateMutation],
  );

  const handleModerationSubmit = useCallback(
    (values: ModerationSettingsValues) => {
      updateMutation.mutate({ moderation: values });
    },
    [updateMutation],
  );

  const handleNotificationsSubmit = useCallback(
    (values: NotificationSettingsValues) => {
      updateMutation.mutate({ notifications: values });
    },
    [updateMutation],
  );

  const handleFlagToggle = useCallback(
    (key: string, enabled: boolean) => {
      flagMutation.mutate({ key, enabled });
    },
    [flagMutation],
  );

  // ──── States ────
  if (settingsQuery.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <LoadingState rows={6} />
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />
        <ErrorState
          title="Failed to load settings"
          description="Please try again."
          onRetry={() => settingsQuery.refetch()}
        />
      </div>
    );
  }

  const settings = settingsQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <Tabs defaultValue="general" orientation={isTablet ? "vertical" : "horizontal"}>
        {/* ── Mobile: horizontal scroll tabs at top ── */}
        {/* ── Tablet/Desktop: vertical tab rail + content pane ── */}
        <div
          className={
            isTablet
              ? "flex gap-6"
              : "flex flex-col gap-4"
          }
        >
          <TabsList
            className={
              isTablet
                ? "flex h-auto w-48 shrink-0 flex-col items-stretch justify-start gap-1 bg-transparent p-0"
                : "flex w-full overflow-x-auto"
            }
          >
            <TabsTrigger
              value="general"
              className={
                isTablet
                  ? "justify-start px-4 py-2 data-[state=active]:bg-muted"
                  : undefined
              }
            >
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className={
                isTablet
                  ? "justify-start px-4 py-2 data-[state=active]:bg-muted"
                  : undefined
              }
            >
              {t("tabs.moderation")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={
                isTablet
                  ? "justify-start px-4 py-2 data-[state=active]:bg-muted"
                  : undefined
              }
            >
              {t("tabs.notifications")}
            </TabsTrigger>
            <TabsTrigger
              value="flags"
              className={
                isTablet
                  ? "justify-start px-4 py-2 data-[state=active]:bg-muted"
                  : undefined
              }
            >
              {t("tabs.flags")}
            </TabsTrigger>
          </TabsList>

          <div className="min-w-0 flex-1 md:max-w-2xl lg:max-w-3xl">
            <TabsContent value="general" className="mt-0">
              <PermissionGate
                require={PERMISSIONS.SETTINGS_WRITE}
                fallback={
                  <p className="text-sm text-muted-foreground">
                    You do not have permission to edit settings.
                  </p>
                }
              >
                <GeneralSettingsForm
                  defaultValues={settings.general}
                  onSubmit={handleGeneralSubmit}
                  isPending={updateMutation.isPending}
                />
              </PermissionGate>
            </TabsContent>

            <TabsContent value="moderation" className="mt-0">
              <PermissionGate
                require={PERMISSIONS.SETTINGS_WRITE}
                fallback={
                  <p className="text-sm text-muted-foreground">
                    You do not have permission to edit settings.
                  </p>
                }
              >
                <ModerationSettingsForm
                  defaultValues={settings.moderation}
                  onSubmit={handleModerationSubmit}
                  isPending={updateMutation.isPending}
                />
              </PermissionGate>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <PermissionGate
                require={PERMISSIONS.SETTINGS_WRITE}
                fallback={
                  <p className="text-sm text-muted-foreground">
                    You do not have permission to edit settings.
                  </p>
                }
              >
                <NotificationSettingsForm
                  defaultValues={settings.notifications}
                  onSubmit={handleNotificationsSubmit}
                  isPending={updateMutation.isPending}
                />
              </PermissionGate>
            </TabsContent>

            <TabsContent value="flags" className="mt-0">
              <FeatureFlagsPanel
                flags={settings.featureFlags}
                onToggle={handleFlagToggle}
                isPending={flagMutation.isPending}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
