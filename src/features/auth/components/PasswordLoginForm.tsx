import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader as Loader2, Lock, Mail } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { AppError } from "@/lib/httpClient";
import { queryClient } from "@/lib/queryClient";
import { passwordCredentialsSchema, type PasswordCredentialsInput } from "../password/schemas";
import { passwordLogin } from "../api";
import { useAuthStore } from "@/stores/authStore";

export function PasswordLoginForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);

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
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {t("login.emailLabel")}
              </FormLabel>
              <FormControl>
                <FieldInput
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  autoComplete="email"
                  disabled={isPending}
                  icon={<Mail className="h-4 w-4" />}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-400">
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
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {t("login.passwordLabel")}
              </FormLabel>
              <FormControl>
                <FieldInput
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                  disabled={isPending}
                  icon={<Lock className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-slate-500 transition hover:text-teal-300"
                      aria-label={t(showPassword ? "login.hidePassword" : "login.showPassword")}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-400">
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
          className="h-11 w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-[0_10px_30px_-10px_rgba(45,212,191,0.6)] transition hover:from-teal-300 hover:to-cyan-300 focus-visible:ring-teal-400 disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("login.submitting")}
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              {t("login.submit")}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

const FieldInput = ({ icon, trailing, className, ...props }: FieldInputProps) => (
  <div
    className={cn(
      "group relative flex items-center rounded-lg border border-slate-800 bg-slate-950/70 transition focus-within:border-teal-400/60 focus-within:ring-1 focus-within:ring-teal-400/40",
      className,
    )}
  >
    {icon ? (
      <span className="pl-3 text-slate-500 group-focus-within:text-teal-300">{icon}</span>
    ) : null}
    <Input
      {...props}
      className="h-11 border-0 bg-transparent px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
    />
    {trailing ? <span className="pr-3">{trailing}</span> : null}
  </div>
);
