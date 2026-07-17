# Testing

This document describes how automated tests are structured, run, and expected to be written in this project. Tests are a first-class part of the codebase — they follow the same rules as production code.

---

## Stack

- **Vitest** as the test runner.
- **jsdom** as the DOM environment (`test/setup.ts` provides `matchMedia`, `ResizeObserver`, `scrollTo`, `scrollIntoView` polyfills).
- **@testing-library/react** for rendering and assertions.
- **@testing-library/user-event** for user interactions.
- **@testing-library/jest-dom** custom matchers, imported once in `test/setup.ts`.
- **React Query** and **React Router** are exercised through real providers; there is no manual mocking of these libraries.
- **Mock API adapter** — the same in-memory mock the app uses in dev (`src/mocks/`) is what integration tests hit. Do not stub `httpClient` or `axios` directly.

Config lives in `vitest.config.ts` (aliases + jsdom + setup) and `tsconfig.test.json` (types).

---

## Layout

All tests live under a top-level `test/` directory. They are **not** colocated with the source they cover — a single directory tree keeps the source signal-to-noise high and makes coverage boundaries obvious.

```
test/
  setup.ts                        # jsdom polyfills, i18n boot, storage/cleanup
  utils/
    renderWithProviders.tsx       # QueryClient + Router + TooltipProvider wrapper
    fixtures.ts                   # resetStores, signInAs, membership factories
  unit/
    lib/                          # pure helpers (sanitize, permissions, utils, ...)
    hooks/                        # every hook in src/hooks/
    stores/                       # every Zustand slice
    features/<name>/              # schemas + adaptors + feature-local logic
    components/common/            # every composite in src/components/common/
  integration/
    auth/                         # login flow, guards
    pages/                        # route-level pages exercising Suspense + mock adapter
```

Rule of thumb:

- **Unit tests** cover one module in isolation (a hook, an adaptor, a Zod schema, a component with props). They must not care about routing, queries, or auth state unless the module under test cares about them.
- **Integration tests** cover multiple layers together — a page mounted inside a router, hitting the real mock adapter through React Query, with a signed-in fixture user in the store.

The internal tree of `test/unit/` and `test/integration/` mirrors `src/` so a reader can find "the test for X" by mechanical path translation.

---

## Test-code rules

Test code obeys the same rules as production code (see `BEST_PRACTICES.md`). In particular:

- **No `useEffect` in test helpers** unless it wraps a listener (same as production).
- **No direct Radix imports** — go through shadcn primitives when rendering fixtures.
- **No cross-feature imports.** A test for feature X must not reach into feature Y's internals.
- **No emoji, no ambient globals.** Vitest globals (`describe`, `it`, `expect`, `vi`) come from `vitest`; import them explicitly at the top of each file for parity with the source's import discipline.
- **Small files.** A `.test.tsx` file covers one module; split when it grows past a few describe blocks.
- **Deterministic.** No `Math.random()` outside seeded mocks, no wall-clock assumptions, no reliance on network. Use `vi.useFakeTimers()` for anything time-based.
- **No `data-testid` cluttering source.** Prefer accessible queries (`getByRole`, `getByLabelText`, `getByText`) over test IDs. Add a test ID only when the DOM offers no accessible handle.

---

## The four-state contract

Every data-driven view has four states the tests must exercise:

1. **Loading** — asserted at the boundary layer (`RouteBoundary`). Test the wrapper (see `test/unit/components/common/RouteBoundary.test.tsx`) once, and trust it for every consumer; do not re-test every page's spinner.
2. **Empty** — assert that `DataTable` / `DataList` render `EmptyState` when `items.length === 0`. Their tests already cover this; features that reuse these composites inherit the guarantee.
3. **Error** — assert that `RouteBoundary` catches thrown errors and renders `ErrorState` with a working retry. Feature tests may additionally check that a failing query surfaces a domain-specific message.
4. **Success** — assert the rendered data. For integration tests, wait on a stable piece of copy (section title, column header, data row) with `findByText` / `findByRole` — never fixed `setTimeout`.

---

## Rendering with providers

Use the `renderWithProviders` wrapper from `test/utils/renderWithProviders.tsx`. It gives you:

- A fresh `QueryClient` with retries disabled and zero gc/stale time.
- A `MemoryRouter` seeded at `route` (default `/`).
- `TooltipProvider` (many shadcn primitives require it).
- i18n imported once, so `useTranslation` works out of the box.

Do not construct providers by hand in individual test files.

```tsx
renderWithProviders(<UsersListPage />, { route: "/t/luna/users" });
```

For routing-heavy tests that need `createMemoryRouter` (loaders, errorElement), skip the wrapper and mount the router directly — see `test/unit/components/common/RouteErrorFallback.test.tsx` for the pattern.

---

## Store fixtures

Never mutate a Zustand store by importing its internals in an ad-hoc way. Use `test/utils/fixtures.ts`:

- `resetStores()` — call in `beforeEach` to guarantee isolation.
- `signInAs(user, memberships?)` — populates the auth store as if a password login just finished.
- `activateTenant(id, slug)` — populates the tenant store.
- `superAdminFixture` / `operatorFixture` / `membershipFixture()` — canonical seed data.

If you need a new fixture, add it to `fixtures.ts` — do not scatter one-off store writes across test files.

---

## Integration tests and the mock adapter

Integration tests hit the same in-memory mock the dev environment uses. That is on purpose: it means our tests exercise the real Zod schemas, real adaptors, and real React Query wiring. If a schema changes and adaptors don't, an integration test breaks.

- `VITE_MOCK_API=true` is set in `.env`, which activates the mock adapter in `httpClient.ts`. Vitest loads the same env, so no extra config is needed.
- Seed credentials come from `src/mocks/seeds/accounts.ts` — `admin`/`admin` (super admin) and `operator`/`operator` (Luna admin + Orbit moderator).
- To pin a specific tenant for a test, call `activateTenant("tnt_luna", "luna")` after `signInAs`.

When the real backend replaces the mock (see `MOCKS.md`), integration tests that hit named endpoints will need to be re-pointed at a test double (msw, or a contract-verified stub). The unit layer stays untouched because it never crossed the network in the first place.

---

## Running

```bash
npm test                 # one-shot, all files
npm run test:watch       # watch mode
npm run coverage         # v8 coverage report (text + html)
```

Coverage is reported for `src/**/*.{ts,tsx}` excluding `src/mocks/**`, `src/app/router.tsx`, and `*.d.ts` files (see `vitest.config.ts`). Do not lower these thresholds to unblock a PR — cover the new code.

Before declaring work done, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build:development
```

All four must exit clean.

---

## Adding a test

1. Decide unit vs. integration:
   - Pure module / hook / adaptor / schema / small component → unit, mirror the source path under `test/unit/`.
   - Anything that goes through the router, a Zustand store, and the mock adapter together → integration, under `test/integration/`.
2. Write the file next to its neighbours. Follow the imports the neighbours use (Vitest first, testing-library second, source under `@/`, fixtures under `@test/`).
3. Cover the four states (loading, empty, error, success) for any data view.
4. Never widen a lint rule to fit the test. Prefer a smaller test.

---

## Change log

- 2026-07-17 — Initial version.
