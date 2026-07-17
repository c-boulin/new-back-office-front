import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ArrowRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserMenu } from "@/components/common/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { applyTenantTheme } from "@/lib/tenantTheme";
import { useDebounce } from "@/hooks/useDebounce";
import { useDefaultTheme } from "@/hooks/useDefaultTheme";
import type { TenantMembership } from "@/features/tenants/types";

export function TenantChooserPage() {
  useDefaultTheme();

  const { t } = useTranslation("tenants");
  const memberships = useAuthStore((s) => s.memberships);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 200);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return memberships;
    return memberships.filter(
      (m) =>
        m.tenantName.toLowerCase().includes(q) ||
        m.tenantSlug.toLowerCase().includes(q),
    );
  }, [memberships, debounced]);

  const pickTenant = (m: TenantMembership) => {
    setActiveTenant({ id: m.tenantId, slug: m.tenantSlug, theme: m.theme });
    applyTenantTheme(m.theme);
    navigate(`/t/${m.tenantSlug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Building2 className="h-4 w-4" aria-hidden />
          <span>{t("chooser.brand")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-8 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("chooser.title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("chooser.description")}
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("chooser.search")}
              aria-label={t("chooser.search")}
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title={t("chooser.empty")} icon={Building2} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <button
                key={m.tenantId}
                onClick={() => pickTenant(m)}
                className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={m.tenantName}
              >
                <Card className="overflow-hidden border-border/70 transition-shadow group-hover:shadow-md group-focus-visible:shadow-md">
                  <div
                    aria-hidden
                    className="h-1.5 w-full"
                    style={
                      m.theme
                        ? { background: `hsl(${m.theme.primary})` }
                        : { background: "hsl(var(--primary))" }
                    }
                  />
                  <CardContent className="flex items-start gap-4 p-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-primary"
                      style={
                        m.theme
                          ? {
                              backgroundColor: `hsl(${m.theme.primary} / 0.12)`,
                              color: `hsl(${m.theme.primary})`,
                            }
                          : undefined
                      }
                    >
                      <Building2 className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium">{m.tenantName}</p>
                      <p className="truncate text-xs text-muted-foreground">/{m.tenantSlug}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {m.role}
                        </Badge>
                        {m.lastAccessedAt ? (
                          <span className="text-xs text-muted-foreground">
                            {t("chooser.lastAccessed")}:{" "}
                            {new Date(m.lastAccessedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            {t("chooser.back")}
          </Button>
        </div>
      </main>
    </div>
  );
}
