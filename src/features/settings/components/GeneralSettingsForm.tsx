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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { TenantSettings } from "../types";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

const generalSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactEmail: z.string().email("Must be a valid email address"),
  timezone: z.string().min(1, "Timezone is required"),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

type GeneralSettingsFormProps = {
  defaultValues: TenantSettings["general"];
  onSubmit: (values: GeneralSettingsValues) => void;
  isPending: boolean;
};

export function GeneralSettingsForm({
  defaultValues,
  onSubmit,
  isPending,
}: GeneralSettingsFormProps) {
  const { t } = useTranslation("settings");

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: defaultValues.name,
      contactEmail: defaultValues.contactEmail,
      timezone: defaultValues.timezone,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("general.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("general.name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("general.contactEmail")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("general.timezone")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("general.timezone")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
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
