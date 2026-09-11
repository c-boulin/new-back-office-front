# Component API reference

All primitives in `src/components/ui` come from shadcn/ui unchanged. Do **not**
recreate any of them. The composed common components below layer on top.

Every component is:

- **Keyboard reachable** with visible focus rings from shadcn.
- **ARIA-labeled** where the visual affordance is not enough.
- **Themed via CSS variables** — the same component re-skins per tenant.
- **Responsive by default** — mobile-first breakpoints.
- **Silent by default** — no console noise, no side effects at import time.

## Testing

Every composite in this document has a test under `test/unit/components/common/`. Tests exercise:

- **Rendering shape.** Required props render the expected roles / labels.
- **The four-state contract.** `DataTable` / `DataList` render `EmptyState` when items are empty; `RouteBoundary` renders its loading fallback while suspending and its error fallback on thrown errors. Feature composites inherit this coverage automatically.
- **User interactions.** `ConfirmDialog` typed-confirmation, `FilterRow` reset, `TenantSwitcher` selection, `UserMenu` sign-out, `LanguageSwitcher` locale swap.
- **Store side effects.** `TenantSwitcher` updates `tenantStore` and re-applies the destination tenant theme via `applyTenantTheme`; `UserMenu` clears `authStore` **and** calls `resetTenantTheme()` so no CSS variables linger past sign-out; `SessionExpiredDialog` reacts to `authStore.status === "expired"`.

When adding a new composite, add its test in the same commit — mirror the source path under `test/unit/components/common/`, use `renderWithProviders`, and prefer accessible queries (`getByRole`, `getByLabelText`) over `data-testid`. See `docs/TESTING.md` for the full harness.

## `PageHeader`

```tsx
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

<PageHeader
  title="Users"
  description="Search, review, and moderate every account on this tenant."
  actions={<Button>New user</Button>}
/>;
```

Props:

- `title: ReactNode` — heading text (required).
- `description?: ReactNode` — subtitle.
- `actions?: ReactNode` — right-aligned action cluster.

## `StatCard`

```tsx
import { StatCard } from "@/components/common/StatCard";
import { Users } from "lucide-react";

<StatCard
  label="Active users"
  value="12,486"
  hint="Last 7 days"
  trend={{ direction: "up", label: "+8.2% vs previous" }}
  icon={Users}
/>;
```

Props:

- `label: string` — small caption.
- `value: string | number` — headline number.
- `hint?: string` — small explanation.
- `trend?: { direction: "up" | "down" | "flat"; label: string }`.
- `icon?: LucideIcon`.

## Loading / empty / error contract

Every data view uses the four-state contract. The preferred wiring is
`useSuspenseQuery` inside a content component + `RouteBoundary` at the page
level, so pages never write per-component `isPending` / `isError` branches.

```tsx
// page shell
<RouteBoundary>
  <UsersTable ... />
</RouteBoundary>

// leaf component
const { data } = useSuspenseQuery({ queryKey, queryFn });
```

- **Loading:** `RouteBoundary` shows `<LoadingState />` (or a supplied
  `loadingFallback`) while the suspending query resolves.
- **Empty:** `DataTable` and `DataList` render `<EmptyState />` when their
  items array is empty — no manual check needed.
- **Error:** `RouteBoundary` catches thrown errors from suspense queries and
  renders `<ErrorState onRetry={reset} />` wired to
  `QueryErrorResetBoundary`.
- **Success:** the real content.

Never conflate loading and empty. A pending query is not an empty state.

## `RouteBoundary`

```tsx
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { LoadingCards } from "@/components/common/LoadingState";

<RouteBoundary loadingFallback={<LoadingCards count={4} />}>
  <MatchesOverview />
</RouteBoundary>;
```

Props:

- `children: ReactNode` — usually a component that calls `useSuspenseQuery`.
- `loadingFallback?: ReactNode` — override the default `LoadingState`.
- `errorFallback?: (args: { error; reset }) => ReactNode` — override the
  default `ErrorState`.

`RouteBoundary` wraps `Suspense` inside a `QueryErrorResetBoundary` so the
retry action re-runs the failed query.

## `DataTable<T>`

Wraps `@tanstack/react-table` on top of shadcn Table. Supports server
pagination and controlled sorting. Renders `<EmptyState />` automatically when
`data` is empty.

```tsx
<DataTable<UserRecord>
  columns={columns}
  data={query.data.items}
  getRowId={(row) => row.id}
  serverPagination={{
    pagination,
    onPaginationChange: setPagination,
    pageCount: Math.ceil(total / pageSize),
  }}
  emptyTitle="No users"
  emptyDescription="Try a different filter."
/>
```

Columns are plain `ColumnDef<T, unknown>[]` from `@tanstack/react-table`.

## `DataList<T>`

Mobile-first counterpart to `DataTable`. Consumers pair the two behind
`useMediaQuery("(max-width: 768px)")` so each device gets a purpose-built
layout instead of a resized table.

```tsx
if (isMobile) {
  return (
    <DataList
      items={data.items}
      getKey={(u) => u.id}
      serverPagination={{ pagination, onPaginationChange, pageCount }}
      renderCard={(u) => <UserCard user={u} />}
    />
  );
}
```

## `FilterBar` / `FilterRow`

```tsx
<FilterBar
  search={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search users"
  onReset={reset}
>
  <Select value={status} onValueChange={setStatus}>...</Select>
</FilterBar>
```

`FilterRow` is the same shape without the search input, for pages whose only
filter is a select.

## `useUrlState`

Persists filter and pagination state in the URL so it survives reloads and
back-navigation. Pair with `RouteBoundary` — the suspense fallback shows
while the query keyed on URL params refetches.

```tsx
const [state, setState] = useUrlState({
  q: urlString(""),
  status: urlEnum(STATUSES, "all"),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
});
```

## `ConfirmDialog`

Destructive actions use typed confirmation.

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Ban this user?"
  description="Immediate revoke. Logged in audit."
  destructive
  typedConfirmationValue="BAN"
  loading={mutation.isPending}
  onConfirm={() => mutation.mutate(id)}
/>
```

## `PermissionGate`

Renders children only if the current user has the required permission on the
active tenant. Super-admins bypass. Wrap every destructive action cluster —
approve/reject/escalate on moderation, resolve/dismiss on reports,
verify/ban/unban on users — so unauthorized operators do not see them at all.

```tsx
<PermissionGate require={PERMISSIONS.USERS_MODERATE} fallback={<Locked />}>
  <Button variant="destructive">Ban</Button>
</PermissionGate>
```

## `TenantSwitcher`

Renders only when the user has more than one membership. Clears React Query
cache on switch and navigates to `/t/:slug`. Applies the destination tenant's
theme via `applyTenantTheme`; leaving a tenant is what resets it — either
implicitly via `useDefaultTheme()` on cross-tenant pages, or explicitly via
`resetTenantTheme()` in `UserMenu` on sign-out.

## `TenantChooserPage`

Rendered outside `RequireTenant`, so it calls `useDefaultTheme()` on mount to
guarantee the neutral base tokens are in place. The shell (background, header,
search) stays neutral for every visitor; each membership tile can carry its
own branded strip / logo, but the strip is scoped to the tile — the CSS
variables at `:root` do not change.

## `LanguageSwitcher`

Toggles between `en` and `fr` via `i18n.changeLanguage`. Preference persists in
`localStorage`.

## `UserMenu`

Session dropdown with sign-out through the OIDC provider or the password
endpoint, depending on `authStore.method`. Sign-out clears `authStore` **and**
calls `resetTenantTheme()` so no tenant CSS variables leak onto the auth
surfaces that render next.

## `SessionExpiredDialog`

Blocks the UI when `authStore.status === "expired"` and offers a re-auth CTA.
Rendered by both `TenantLayout` and `SuperAdminLayout`.
