# Component API reference

All primitives in `src/components/ui` come from shadcn/ui unchanged. Do **not**
recreate any of them. The composed common components below layer on top.

Every component is:

- **Keyboard reachable** with visible focus rings from shadcn.
- **ARIA-labeled** where the visual affordance is not enough.
- **Themed via CSS variables** — the same component re-skins per tenant.
- **Responsive by default** — mobile-first breakpoints.
- **Silent by default** — no console noise, no side effects at import time.

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

## `EmptyState`, `ErrorState`, `LoadingState`

Use for the four-state contract. All accept `className` for layout.

```tsx
if (query.isPending) return <LoadingState rows={6} />;
if (query.isError)   return <ErrorState onRetry={query.refetch} />;
if (query.data.length === 0) {
  return <EmptyState title="No users" description="Nothing here yet." />;
}
```

## `DataTable<T>`

Wraps `@tanstack/react-table` on top of shadcn Table. Supports server
pagination and controlled sorting.

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

## `FilterBar`

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
active tenant. Super-admins bypass.

```tsx
<PermissionGate require={PERMISSIONS.USERS_MODERATE} fallback={<Locked />}>
  <Button variant="destructive">Ban</Button>
</PermissionGate>
```

## `TenantSwitcher`

Renders only when the user has more than one membership. Clears React Query
cache on switch and navigates to `/t/:slug`.

## `LanguageSwitcher`

Toggles between `en` and `fr` via `i18n.changeLanguage`. Preference persists in
`localStorage`.

## `UserMenu`

Session dropdown with sign-out through the OIDC provider.

## `SessionExpiredDialog`

Blocks the UI when `authStore.status === "expired"` and offers a re-auth CTA.
Rendered by both `TenantLayout` and `SuperAdminLayout`.
