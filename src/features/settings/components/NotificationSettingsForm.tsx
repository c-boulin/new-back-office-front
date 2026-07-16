import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { TenantSettings } from "../types";

const notificationSettingsSchema = z.object({
  emailOnNewReport: z.boolean(),
  emailOnEscalation: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type NotificationSettingsValues = z.infer<
  typeof notificationSettingsSchema
>;

type NotificationSettingsFormProps = {
  defaultValues: TenantSettings["notifications"];
  onSubmit: (values: NotificationSettingsValues) => void;
  isPending: boolean;
};

export function NotificationSettingsForm({
  defaultValues,
  onSubmit,
  isPending,
}: NotificationSettingsFormProps) {
  const { t } = useTranslation("settings");

  const form = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailOnNewReport: defaultValues.emailOnNewReport,
      emailOnEscalation: defaultValues.emailOnEscalation,
      weeklyDigest: defaultValues.weeklyDigest,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="emailOnNewReport"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("notifications.newReport")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailOnEscalation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("notifications.escalation")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weeklyDigest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("notifications.weeklyDigest")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {t("actions.save")}
        </Button>
      </form>
    </Form>
  );
}
