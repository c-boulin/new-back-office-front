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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { TenantSettings } from "../types";

const moderationSettingsSchema = z.object({
  autoFlagThreshold: z.coerce
    .number()
    .int()
    .min(1, "Threshold must be at least 1"),
  requirePhotoVerification: z.boolean(),
  allowAnonymousReports: z.boolean(),
});

export type ModerationSettingsValues = z.infer<typeof moderationSettingsSchema>;

type ModerationSettingsFormProps = {
  defaultValues: TenantSettings["moderation"];
  onSubmit: (values: ModerationSettingsValues) => void;
  isPending: boolean;
};

export function ModerationSettingsForm({
  defaultValues,
  onSubmit,
  isPending,
}: ModerationSettingsFormProps) {
  const { t } = useTranslation("settings");

  const form = useForm<ModerationSettingsValues>({
    resolver: zodResolver(moderationSettingsSchema),
    defaultValues: {
      autoFlagThreshold: defaultValues.autoFlagThreshold,
      requirePhotoVerification: defaultValues.requirePhotoVerification,
      allowAnonymousReports: defaultValues.allowAnonymousReports,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="autoFlagThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("moderation.threshold")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="3"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                {t("moderation.thresholdHint")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirePhotoVerification"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("moderation.photoVerification")}
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
          name="allowAnonymousReports"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("moderation.anonymousReports")}
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
