# Admin Panel Architecture

A production-grade, multi-tenant admin console for dating products. Pure React
frontend that speaks to one external backend API. This document is the source
of truth for architectural rules — read it before adding anything that touches
routing, state, data, or design.

## Golden rules

1. **Async / server state → React Query.** Never fetch in `useEffect` and store
   in `useState`. `useSuspenseQuery` is preferred at the route level.
2. **Global client state → Zustand.** Only auth session, active tenant, and UI
   preferences. **Do not mirror server data in stores.**
3. **Local UI state → `useState`.** For UI concerns confined to one component.
4. **Non-rendering state → `useRef`.** Anything a change of which shouldn't
   trigger a rerender (scroll positions, timers, previous values).
5. **Avoid `useEffect` except for listeners / subscriptions.** OIDC events,
   `storage` events, `matchMedia`, keyboard shortcuts, WebSocket / SSE.
6. **No duplicated state.** Derive from a single source. If two variables can
   drift, one of them is a bug.
7. **Small, single-responsibility components.** Extract logic to hooks when a
   component grows a second concern.
8. **Design system before business logic.** Use `shadcn/ui` primitives; compose
   them in `src/components/common`; never recreate a primitive.
9. **Validate every server payload with Zod, then adapt to a domain model.**
   The Validator-Adaptor lives at the edge (feature `api.ts`), never in
   components.
10. **Sanitize every user-provided string before it reaches the DOM or the
    backend** (`sanitizeText` / `sanitizeHtml`).

## Tech stack

- **Runtime:** React 18 + TypeScript strict.
- **Build:** Vite.
- **Routing:** react-router-dom v6 (data router + lazy + Suspense).
- **UI primitives:** shadcn/ui on top of Radix + Tailwind. **Never recreate a
  primitive shadcn ships** (Button, Dialog, Table, Sheet, Tabs, DropdownMenu,
  Command, Popover, Select, Checkbox, Switch, Avatar, Badge, Alert, Skeleton,
  Tooltip, Separator, ScrollArea).
- **Server state:** `@tanstack/react-query` v5.
- **Global client state:** `zustand` with `immer` + `persist`.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Validation:** `zod` for every schema; sanitization via `dompurify`.
- **HTTP:** `axios` with a single client, interceptors for auth + tenant + refresh.
- **Auth:** `oidc-client-ts` (generic OIDC PKCE). Internal SSO only, no
  password, no bypass — including super-admins.
- **i18n:** `react-i18next` + `i18next-browser-languagedetector`. English and
  French; per-feature namespaces.
- **Tables:** `@tanstack/react-table` on top of shadcn Table.

## Multi-tenant model

- A **tenant** is a product (each dating app instance). It has its own users,
  reports, moderation queue, subscriptions, feature flags, and theme.
- A **membership** links a user to a tenant with a role and a permission set.
- **Super admins** are outside the tenant scope. They manage tenants
  themselves.
- **Post-login routing** (`PostLoginRouter`):
  - `isSuperAdmin` → `/admin`
  - `memberships.length === 0` → `/access-denied`
  - `memberships.length === 1` → auto-select, `/t/:slug`
  - `memberships.length > 1` → `/tenants` (chooser)
- **Active tenant** lives in `tenantStore` **and** in the URL segment
  `/t/:tenantSlug`. The URL is authoritative on hard reload; `RequireTenant`
  reconciles them.
- **Every backend call** carries `X-Tenant-Id`, injected by the axios request
  interceptor from `tenantStore`. Switching tenants clears the React Query
  cache scoped to the previous tenant.

## Theming per tenant

- All shadcn tokens are driven by CSS variables (see `src/index.css` and
  `tailwind.config.js`).
- `applyTenantTheme(theme)` sets those variables on `:root`. Called on tenant
  activation and by `ThemeProvider`.
- Super-admin theme editor writes to the tenant record; `TenantMembership.theme`
  is used to re-skin the tenant layout on entry.
- Do **not** hardcode colors in components — use `bg-primary`, `text-accent`,
  etc. The same components must re-skin for any tenant.

## Authentication

- Global, mandatory internal SSO via OIDC + PKCE. `oidcClient` in
  `src/lib/oidcClient.ts`.
- `LoginPage` shows one button: **Continue with SSO**. There is no password
  form anywhere, including for super-admins.
- `AuthProvider` boots the session, listens for `userLoaded`,
  `accessTokenExpired`, `silentRenewError`, and cross-tab `storage` events.
- `httpClient` interceptor refreshes silently on 401 with a single-flight
  promise; on failure it flips `authStore.status` to `expired` and
  `SessionExpiredDialog` prompts a fresh sign-in.

## Data flow (Validator-Adaptor)

```
raw HTTP payload
  ↓  zod schema (feature/schemas.ts)          ← catches server drift
parsed raw
  ↓  adaptor (feature/adaptors.ts)            ← snake_case → domain camelCase
domain model (feature/types.ts)
  ↓
React Query cache
  ↓
components (only read domain models)
```

Use `validateAndAdapt` / `validateAndAdaptList` from `src/lib/validatorAdaptor.ts`.
Components must never touch raw payloads.

## State decision tree

| Case                                            | Use            |
| ----------------------------------------------- | -------------- |
| Fetched from server                             | React Query    |
| Session, active tenant, UI prefs                | Zustand        |
| Confined to one component                       | `useState`     |
| Doesn't need to rerender                        | `useRef`       |
| Derivable from other state                      | Just derive it |

## Forms

- `react-hook-form` + `zodResolver`. Colocated schema per form.
- `dompurify` free-text before submission.
- `FormField` / `FormControl` / `FormMessage` (`src/components/ui/form.tsx`)
  wire `aria-invalid` and `aria-describedby` automatically.
- Submit buttons must be `disabled` while the mutation is `isPending`.

## Loading / empty / error contract

Every data view must handle **four** branches explicitly:

- **Loading:** `<LoadingState />` or a component-specific `Skeleton`.
- **Empty:** `<EmptyState title description icon action />`.
- **Error:** `<ErrorState onRetry={refetch} />`.
- **Success:** the real content.

Do not conflate "loading" and "empty". A pending query is not an empty state.

## Accessibility

- Every interactive element is keyboard reachable; focus styles come from
  shadcn — do not remove them.
- Every form control has a `<label>` and (when in error) `aria-invalid`.
- Every dialog / sheet has a `DialogTitle` (even if visually hidden).
- Skip-to-content link in every layout (`#main`).
- Live regions for async status where meaningful (see `LoadingState`).

## Responsiveness

- Mobile-first. Layouts use CSS grid + flex.
- Sidebar collapses into a `Sheet` on `md-`.
- `DataTable` becomes a card list on narrow screens (per feature).
- Never rely on hover for a critical action — provide a tap target.

## Folder map

```
src/
  app/
    router.tsx                       route tree + lazy + Suspense
    layouts/                         AuthLayout, TenantLayout, SuperAdminLayout
    guards/                          RequireAuth, RequireSuperAdmin, RequireTenant
    providers/                       AppProviders, AuthProvider, ThemeProvider
    RootErrorBoundary.tsx
  components/
    ui/                              shadcn primitives — NEVER duplicate here
    common/                          composed design system (PageHeader,
                                     DataTable, EmptyState, ErrorState,
                                     LoadingState, ConfirmDialog, FilterBar,
                                     TenantSwitcher, LanguageSwitcher,
                                     UserMenu, PermissionGate,
                                     SessionExpiredDialog, PlaceholderPage,
                                     StatCard)
  features/
    <feature>/
      api.ts                         HTTP calls, returns domain models
      schemas.ts                     Zod schemas for raw payloads
      adaptors.ts                    Raw → domain mappers
      types.ts                       Domain models
      pages/                         Route components
      components/                    Feature-only components
      hooks/                         Feature-only hooks (optional)
  hooks/                             Cross-feature hooks (useDebounce,
                                     usePagination, usePermissions,
                                     useActiveTenant, useMediaQuery)
  lib/                               httpClient, queryClient, oidcClient,
                                     i18n, env, permissions, sanitize,
                                     tenantTheme, validatorAdaptor, utils
  locales/
    en/                              per-namespace JSON
    fr/                              per-namespace JSON
  stores/                            authStore, tenantStore, uiStore
  index.css                          Tailwind + CSS variables
  main.tsx                           entry point
```

## Adding a feature — checklist

1. Create `src/features/<name>/{api,schemas,adaptors,types,pages,components}.ts`.
2. Define Zod schemas that mirror the raw payload exactly (snake_case).
3. Define domain types (camelCase) in `types.ts`.
4. Write adaptors — pure functions, no side effects.
5. In `api.ts`, call `httpClient` then run through `validateAndAdapt`.
6. Add a locale namespace in `en` and `fr` and import it in `src/lib/i18n.ts`.
7. Add the route (lazy) in `src/app/router.tsx`.
8. Update the sidebar in `TenantLayout` or `SuperAdminLayout`.
9. Handle loading/empty/error explicitly.
10. Add permission gates on destructive actions.

## Anti-patterns (do NOT do)

- Fetching in `useEffect` with `setState`. **Use React Query.**
- Storing server data in Zustand. **Use React Query.**
- Duplicating a piece of state across two hooks. **Derive.**
- Rebuilding a shadcn primitive. **Compose it.**
- Hardcoding colors in components. **Use theme tokens.**
- Putting a password form anywhere. **SSO only, always.**
- Skipping Zod on a response because "the backend is trusted". **Every response
  is validated at the edge.**
- Rendering user-provided HTML directly. **`sanitizeHtml` first.**
