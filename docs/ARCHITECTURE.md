# Admin Panel Architecture

A production-grade, multi-tenant admin console for dating products. Pure React
frontend that speaks to one external backend API.

**Precedence.** `docs/BEST_PRACTICES.md` is the source of truth for all
engineering rules. This document exists only to describe how those rules are
wired into this codebase — routing, state boundaries, auth pipeline, folder
map, feature workflow. If anything here appears to conflict with
`BEST_PRACTICES.md`, `BEST_PRACTICES.md` wins.

## Golden rules

1. **Async / server state → React Query.** Never fetch in `useEffect` and store
   in `useState`. `useSuspenseQuery` is the default at the route level; a
   `RouteBoundary` renders `LoadingState` and `ErrorState` instead of
   per-component `isPending` / `isError` branches.
2. **Global client state → Zustand.** Only auth session, active tenant, and UI
   preferences. **Do not mirror server data in stores.**
3. **Local UI state → `useState`.** For UI concerns confined to one component.
4. **Non-rendering state → `useRef`.** Anything a change of which shouldn't
   trigger a rerender (scroll positions, timers, previous values).
5. **Avoid `useEffect` except for listeners / subscriptions.** OIDC events,
   `storage` events, `matchMedia`, keyboard shortcuts, WebSocket / SSE.
6. **No duplicated state.** Derive from a single source. If two variables can
   drift, one of them is a bug.
7. **Small, single-responsibility components.** Split when a component grows a
   second concern or roughly 200 lines. Extract complex logic to hooks in
   `src/hooks/` or a feature-local `hooks/` folder.
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
  Tooltip, Separator, ScrollArea). Discipline:
  - No competing UI kits — no MUI, Chakra, Ant, Mantine, Headless UI.
  - No direct Radix imports inside a feature — consume through the shadcn
    primitive in `src/components/ui/`.
  - `ui/` stays pure — no i18n, no stores, no feature imports, no business
    logic. `common/` composes primitives with i18n and stores.
  - Styling only through Tailwind + shadcn tokens + `cn()`
    (`src/lib/utils.ts`). No inline `style` for design values.
  - Icons: `lucide-react` only. No emoji.
- **Server state:** `@tanstack/react-query` v5.
- **Global client state:** `zustand` with `immer` + `persist`.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Validation:** `zod` for every schema; sanitization via `dompurify`.
- **HTTP:** `axios` with a single client, interceptors for auth + tenant + refresh.
- **Auth:** `oidc-client-ts` for SSO (OIDC + PKCE); dedicated password endpoints
  for username/password. Both methods are supported and selectable via env.
- **i18n:** `react-i18next` + `i18next-browser-languagedetector`. English and
  French; per-feature namespaces.
- **Tables:** `@tanstack/react-table` on top of shadcn Table.

## Multi-tenant model

- A **tenant** is a product (each dating app instance). It has its own users,
  reports, moderation queue, subscriptions, feature flags, and theme.
- A **membership** links a user to a tenant with a role and a permission set.
- **Super admins** are outside the tenant scope. They manage tenants
  themselves.
- **Post-login routing** (`PostLoginRouter`) is method-agnostic — both SSO and
  password logins land here:
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

Two supported methods, both first-class:

- **Internal SSO** — OIDC + PKCE via `oidc-client-ts` (`src/lib/oidcClient.ts`).
- **Username / password** — dedicated endpoints under
  `src/features/auth/password/{api,schemas,adaptors,types}.ts`. Credentials are
  validated with Zod on submit; the server returns the same session shape as
  SSO.

Which methods are enabled is controlled by `env.auth.ssoEnabled` and
`env.auth.passwordEnabled` in `src/lib/env.ts`. At least one must be enabled;
`LoginPage` renders only the flows that are on.

Shared pipeline — every method must respect it:

- `authStore.method: "sso" | "password"` discriminates the active session.
  Both methods produce the same session shape, expose the same `accessToken`
  under the same `Authorization: Bearer` header, and use the same tenant +
  permission model.
- `AuthProvider` boots the session, listens for `userLoaded`,
  `accessTokenExpired`, `silentRenewError`, and cross-tab `storage` events.
- `httpClient` interceptors refresh silently on 401 with a single-flight
  promise, selecting `refreshSsoSession` or `refreshPasswordSession` based on
  `authStore.method`. On failure it flips `authStore.status` to `expired` and
  `SessionExpiredDialog` prompts a fresh sign-in — the same recovery path for
  both methods.

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

Every data view uses the four-state contract. The canonical wiring is
`useSuspenseQuery` inside a leaf component wrapped in a `RouteBoundary` at the
page shell — pages never write per-component `isPending` / `isError` branches.

```tsx
// page shell
<RouteBoundary>
  <UsersTable ... />
</RouteBoundary>

// leaf component
const { data } = useSuspenseQuery({ queryKey, queryFn });
```

- **Loading:** `RouteBoundary` renders `<LoadingState />` (or a supplied
  `loadingFallback`) while the suspending query resolves.
- **Empty:** `DataTable` and `DataList` render `<EmptyState />` automatically
  when their items array is empty — no manual check needed.
- **Error:** `RouteBoundary` catches thrown errors from suspense queries and
  renders `<ErrorState onRetry={reset} />` wired to
  `QueryErrorResetBoundary`.
- **Success:** the real content.

Do not conflate "loading" and "empty". A pending query is not an empty state.

## Accessibility

- Every interactive element is keyboard reachable; focus styles come from
  shadcn/Radix — do not remove or override them.
- Every form control has a `<label>` and (when in error) `aria-invalid`.
- Every dialog / sheet has a `DialogTitle` (even if visually hidden).
- Skip-to-content link in every layout (`#main`).
- Live regions for async status where meaningful (see `LoadingState`).
- Colour is never the only signal for state — pair with icon or text.
- No `autoFocus` — manage focus explicitly when needed.

## Responsiveness

Mobile, tablet, and desktop each get their own **purpose-built** layout,
navigation, information density, and interactions. Scaling a desktop layout
down or a mobile one up is not acceptable. Verify at `sm`, `md`, and `lg`.

- Tailwind breakpoints, mobile-first authoring.
- Navigation is designed per form factor: bottom bar / sheet on mobile, rail
  or drawer on tablet, persistent sidebar on desktop.
- Tabular data uses card / stack layouts on mobile with different actions and
  emphasis, not a horizontally-scrolled desktop table.
- Never rely on hover for a critical action — provide a tap target.

## Lint / typecheck / build hygiene

Per `BEST_PRACTICES.md` §8:

- Never weaken `eslint.config.js` or `.prettierrc.json` to unblock work — fix
  the code.
- Never disable a lint rule inline without a comment stating why.
- `npm run lint`, `npm run typecheck`, and `npm run build:development` must
  all exit clean before a feature is declared done.
- Imports use the `@/` alias and follow the import plugin's ordering.

## Testing

Automated tests live under a top-level `test/` directory, split into `unit/` and `integration/`. They obey the same rules as production code (no `useEffect` outside listeners, shadcn discipline, no cross-feature imports, no emoji). Integration tests exercise real React Query + Router + the in-memory mock adapter so the Validator-Adaptor pipeline is verified end-to-end. See `docs/TESTING.md` for the harness, fixtures, and four-state contract, and `docs/BEST_PRACTICES.md` §18 for the rule itself.

## Folder map

```
test/
  setup.ts                           # jsdom polyfills, i18n boot, cleanup
  utils/
    renderWithProviders.tsx          # QueryClient + Router + Tooltip wrapper
    fixtures.ts                      # resetStores, signInAs, membership fixtures
  unit/
    lib/                             # sanitize, permissions, utils, ...
    hooks/                           # every hook in src/hooks/
    stores/                          # every Zustand slice
    features/<feature>/              # schemas + adaptors
    components/common/               # every composite in common/
  integration/
    auth/                            # login flow + guards
    pages/                           # route pages exercising RouteBoundary + mocks
```

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
                                     DataTable, DataList, EmptyState,
                                     ErrorState, LoadingState, RouteBoundary,
                                     RouteErrorFallback, ConfirmDialog,
                                     FilterBar, FilterRow, SkipLink,
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
                                     useActiveTenant, useMediaQuery,
                                     useUrlState)
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
9. Handle loading / empty / error explicitly.
10. Add permission gates on destructive actions.
11. Verify no cross-feature imports — shared code lives in `common/`, `hooks/`,
    or `lib/`.
12. Verify no direct Radix imports inside the feature — consume through `ui/`.
13. Verify a purpose-built layout at `sm`, `md`, and `lg` — not a resized copy.
14. Run `npm run lint`, `npm run typecheck`, `npm test`, and
    `npm run build:development` clean.
15. Cover new modules under `test/unit/` (unit) or `test/integration/` (page-level), respecting the layout rules in `docs/TESTING.md`.

## Anti-patterns (do NOT do)

- Fetching in `useEffect` with `setState`. **Use React Query.**
- Storing server data in Zustand. **Use React Query.**
- Duplicating a piece of state across two hooks. **Derive.**
- Rebuilding a shadcn primitive. **Compose it.**
- Importing Radix packages directly inside a feature. **Consume through the
  shadcn primitive in `ui/`.**
- Installing a competing UI kit (MUI, Chakra, Ant, Mantine, Headless UI).
  **shadcn/ui only.**
- Using emoji as icons. **`lucide-react` only.**
- Cross-feature imports. **Promote shared code to `common/`, `hooks/`, or
  `lib/`.** Two exceptions are intentional and codified:
  - `features/auth/*` reads schemas and types from `features/tenants/*`
    because the `/auth/me` response carries the caller's tenant memberships,
    which are structurally owned by the tenants feature. Extracting a third
    package for the shared shape would be pure ceremony.
  - `features/superAdmin/pages/TenantsListPage` renders
    `features/tenants/components/TenantsList` — the same viewer used from
    the tenant chooser. Reusing it beats forking a second table.
- Hardcoding colors in tenant-scoped components. **Use theme tokens** so the
  same component re-skins per tenant. One deliberate exception: the auth
  shell (`AuthLayout`, `LoginCard`, `AuthDivider`, `SsoLoginButton`,
  `WatchtowerBrand`, `PasswordLoginForm`) uses a fixed Watchtower brand
  palette because the user is not signed in yet — there is no tenant to
  theme from, and the login screen is by design a pre-tenant brand surface.
  Everything inside `TenantLayout` / `SuperAdminLayout` must still use
  tokens.
- Bypassing the shared auth pipeline. **Every method must produce the same
  session shape in `authStore` and go through `httpClient` interceptors.
  Never store credentials in state; never call the backend outside
  `passwordLogin` / `passwordRefresh` / `oidcClient`.**
- Skipping Zod on a response because "the backend is trusted". **Every response
  is validated at the edge.**
- Rendering user-provided HTML directly. **`sanitizeHtml` first.**
- Reusing a single base design across breakpoints as a resized variant.
  **Mobile, tablet, and desktop each get their own purpose-built design.**

## Change log

- 2026-07-17 — Added a Testing section and extended the folder map with the
  `test/` tree; feature checklist now requires unit + integration coverage.

- 2026-07-16 — Aligned with `BEST_PRACTICES.md`: declared it the source of
  truth in conflicts, removed the SSO-only clauses, documented password auth
  alongside SSO, rewrote Responsiveness as per-device purpose-built layouts,
  added shadcn discipline (no competing UI kits, no direct Radix imports,
  `ui/` purity, icons via `lucide-react`, no emoji), added accessibility
  items (no `autoFocus`, colour is never the only signal), added the
  lint / typecheck / build hygiene section, and extended the feature
  checklist to match.
