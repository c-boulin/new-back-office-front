# Agent brief

Entry-point index for any agent (human or AI) joining this project. Read this
first; then jump to the linked document for the actual rule text. This file is
a **map**, not a rulebook — it never restates a rule verbatim.

Project in one line: production-grade, multi-tenant admin panel. React 18 +
TypeScript strict, Vite, shadcn/ui on Radix + Tailwind, our own external
backend API (no BaaS, no Supabase).

Precedence: **[`BEST_PRACTICES.md`](./BEST_PRACTICES.md) is the source of
truth.** If anything in this file or elsewhere appears to conflict with it,
`BEST_PRACTICES.md` wins.

## Non-negotiables

- State ladder: **React Query** for server / async, **Zustand** for shared
  client (auth, active tenant, UI prefs only), **`useState`** for local,
  **`useRef`** for values the UI does not read.
- `useEffect` is for listeners and non-React APIs only — never for fetching or
  mirroring state.
- Every server response passes a Zod schema **and** an adaptor via
  `validateAndAdapt` before it can touch the UI or the query cache.
- shadcn discipline: no competing UI kits, no direct Radix imports inside a
  feature, `ui/` stays pure, `common/` composes.
- `lucide-react` icons only. No emoji. No hardcoded design colours inside
  tenant-scoped surfaces — use theme tokens so components re-skin per tenant.
- Four-state contract on every data view: loading, empty, error, success.
  `useSuspenseQuery` in a leaf + `RouteBoundary` at the page shell.
- Cross-feature imports are forbidden. Promote shared code to `common/`,
  `hooks/`, or `lib/`.
- Every module carrying logic has an automated test. Test code obeys the same
  rules as production code.
- Definition of done: `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run build:development`, and `npm run build` all exit clean.

## Where things live

```
src/
  app/{router,layouts,guards,providers}
  components/{ui,common}
  features/<name>/{api,schemas,adaptors,types,pages,components}
  hooks/  lib/  stores/  locales/{en,fr}
test/
  unit/                 mirrors src/ (lib, hooks, stores, features, components)
  integration/{auth,pages}
  utils/{renderWithProviders,fixtures}
```

## Document map

### [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how the rules are wired here

- Golden rules cheat sheet, tech stack, multi-tenant model (`X-Tenant-Id`
  injected by the axios interceptor, URL segment `/t/:slug` authoritative on
  reload).
- Theming per tenant: full CSS-variable surface, `useDefaultTheme()` on any
  page rendered outside `RequireTenant`, dev-only WCAG contrast guard that
  Vite dead-code-eliminates in production.
- Unified auth pipeline: SSO (OIDC + PKCE) and username/password produce the
  same session shape, same `Authorization` header, same refresh single-flight,
  same recovery via `SessionExpiredDialog`.
- Validator-Adaptor diagram, state decision tree, 15-step "Adding a feature"
  checklist, explicit anti-patterns list (including the two codified
  cross-feature exceptions).
- Open when: designing a feature, tracing data flow, or asking "where does
  this live".

### [`BEST_PRACTICES.md`](./BEST_PRACTICES.md) — the source-of-truth ruleset

- 18 numbered sections, each with **Rule / Why / How it applies here**.
- Sections to know cold: §1 recommended libraries, §5 shadcn discipline,
  §10-12 validation + Validator-Adaptor, §15 accessibility, §16 purpose-built
  responsive per device, §17 enforcement checklist, §18 automated tests.
- Open when: arbitrating a disagreement, reviewing a PR, or deciding whether
  a shortcut is allowed.

### [`COMPONENTS.md`](./COMPONENTS.md) — API reference for `src/components/common/`

- Every composite documented with props, contract, and intended composition
  point (`PageHeader`, `StatCard`, `DataTable`, `DataList`, `EmptyState`,
  `ErrorState`, `LoadingState`, `RouteBoundary`, `ConfirmDialog`,
  `FilterBar` / `FilterRow`, `PermissionGate`, `TenantSwitcher`, `UserMenu`,
  `SessionExpiredDialog`, `LanguageSwitcher`, `SkipLink`, `PlaceholderPage`).
- Behavioural notes worth remembering: `TenantSwitcher` re-applies the
  destination tenant theme, `UserMenu` calls `resetTenantTheme()` on sign-out
  so no CSS variables linger, `RouteBoundary` wires
  `QueryErrorResetBoundary` under the hood.
- Open when: about to write UI — check here first before composing a new
  pattern.

### [`MOCKS.md`](./MOCKS.md) — in-memory mock adapter used in dev and tests

- Adapter architecture (`src/mocks/{adapter,router,db,handlers,seeds}`),
  activated by `VITE_MOCK_API=true`, optional persistence via
  `VITE_MOCK_PERSIST=true`.
- Tenant theme seeds must declare the **complete token surface** — use the
  `darkTheme(primary, accent)` helper. Partial themes are how the
  "half-applied" bug slips in.
- The mock is a **test seam**, not a persistence layer. The real backend is
  our own external API; when it lands, features stay untouched because
  everything already flows through `httpClient` + Zod + adaptors.
- Open when: adding a seed, debugging a fixture, or preparing the backend
  swap.

### [`TESTING.md`](./TESTING.md) — the test harness and conventions

- Stack: Vitest + jsdom + Testing Library, real React Query + Router,
  shared mock adapter (never stub `httpClient` or `axios`).
- Harness: `renderWithProviders`, fixtures (`resetStores`, `signInAs`,
  `activateTenant`, membership factories) — no scattered provider stacks.
- Deterministic-only: no wall-clock waits, no `Math.random()` outside seeded
  mocks; `vi.useFakeTimers()` for time-based logic. Prefer accessible queries
  (`getByRole` / `getByLabelText`) over `data-testid`.
- Cross-cutting invariants section: theme-leak guard, store isolation,
  non-super-admin permission checks, i18n-by-key.
- Open when: writing a new test, or debugging a flaky one.

## Quick recipes

- **New feature.** Follow the 15-step checklist in `ARCHITECTURE.md` — always.
- **New data view.** `useSuspenseQuery` in a leaf, `RouteBoundary` at the page
  shell. Do not write `isPending` / `isError` branches by hand.
- **New shared composite.** Add it to `src/components/common/` and mirror a
  unit test under `test/unit/components/common/` in the same commit.
- **New auth method.** Conform to the shared pipeline: same session shape,
  `authStore.method` discriminant, same refresh interceptor.
- **New tenant theme.** Seed in `src/mocks/seeds/tenants.ts` via
  `darkTheme(primary, accent)`. Full-token surface, no partial themes.

## Verification gates

Before declaring any work done: `npm run lint`, `npm run typecheck`,
`npm test`, `npm run build:development`, `npm run build`. All five must exit
clean. Never weaken `eslint.config.js` or `.prettierrc.json` to unblock; never
disable a lint rule inline without a comment stating why.
