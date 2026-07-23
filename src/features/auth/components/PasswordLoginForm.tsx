import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppError } from "@/lib/httpClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { passwordCredentialsSchema, type PasswordCredentialsInput } from "../password/schemas";
import { passwordLogin } from "../api";
import { membershipToProduct } from "../products";
import { useAuthStore } from "@/stores/authStore";
import { useProductsStore } from "@/stores/productsStore";

export function PasswordLoginForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const setProducts = useProductsStore((s) => s.setProducts);
  const [showPassword] = useState(false);

  const form = useForm<PasswordCredentialsInput>({
    resolver: zodResolver(passwordCredentialsSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const session = await passwordLogin(values);
      setSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        method: "password",
      });
      setUser(session.user, session.memberships);
      setProducts(session.memberships.map(membershipToProduct));
      queryClient.setQueryData(["auth", "me"], {
        user: session.user,
        memberships: session.memberships,
      });
      navigate("/", { replace: true });
    } catch (error) {
      const messageKey =
        error instanceof AppError && error.code === "unauthorized"
          ? "errors.invalidCredentials"
          : "errors.generic";
      form.setError("password", { message: messageKey });
      toast.error(t(messageKey));
    }
  });

  const isPending = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          {t("login.emailSectionTitle")}
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="sr-only">{t("login.emailLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  autoComplete="email"
                  aria-label={t("login.emailLabel")}
                  disabled={isPending}
                  className={cn(
                    "h-11 rounded-full border-border bg-card px-5 text-sm",
                    "focus-visible:ring-primary/50",
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email?.message
                  ? t(form.formState.errors.email.message)
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="sr-only">{t("login.passwordLabel")}</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                  aria-label={t("login.passwordLabel")}
                  disabled={isPending}
                  className={cn(
                    "h-11 rounded-full border-border bg-card px-5 text-sm",
                    "focus-visible:ring-primary/50",
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password?.message
                  ? t(form.formState.errors.password.message)
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {t("login.submitting")}
            </>
          ) : (
            t("login.submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
