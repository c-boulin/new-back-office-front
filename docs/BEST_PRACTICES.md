# Best Practices

This document is the source of truth for how we build in this project. Consult it before starting a feature, opening a PR, or reviewing code. Rules are imperative — follow them unless a rule explicitly grants an exception.

Each section states the rule verbatim, a short "Why", and "How it applies here" that points at concrete files already in the repo.

---

## 1. Recommended libraries

**Rule.** Use the recommended libraries:

- Async manager → **React Query**
- Global state → **Zustand**

**Why.** One canonical tool per concern keeps the codebase predictable, avoids overlap, and gives us a single mental model for server state and shared client state.

**How it applies here.**

- Server state, cache, refetch, mutations, and invalidation all go through React Query. Reference: `src/lib/queryClient.ts` and existing `useQuery` / `useMutation` call sites in feature folders.
- Shared client state lives in Zustand slices. Reference: `src/stores/authStore.ts`, `src/stores/tenantStore.ts`, `src/stores/uiStore.ts`.
- Do not introduce Redux, Recoil, Jotai, MobX, Context-as-state, or alternate fetch libraries. `httpClient` (`src/lib/httpClient.ts`) is the only HTTP layer; React Query consumes it.

---

## 2. Avoid `useEffect` (except for listeners)

**Rule.** Do not reach for `useEffect` by default. It is allowed only for listeners and integration with non-React APIs.

**Why.** Most `useEffect` usage is a workaround for state that should have been derived, fetched via React Query, or handled in an event handler. Effects create render-loop hazards and hide data flow.

**How it applies here.**

- Allowed uses: subscribing to `window` / media-query / OIDC events, DOM measurement that must run after paint, cleanup of the above.
- Forbidden uses: fetching data (use React Query), syncing prop → state (derive during render), reacting to user actions (do it in the handler), mirroring one piece of state into another (compute it).

---

## 3. Avoid duplicated state

**Rule.** Avoid duplicated state. In general, have the least possible amount of state.

**Why.** Every extra piece of state is a bug waiting to happen — it drifts out of sync with the source of truth and multiplies edge cases.

**How it applies here.**

- Never copy server data into `useState`; read it from the React Query cache.
- Never mirror a Zustand slice into local state; subscribe with a selector.
- Prefer derived values computed during render over stored ones.

---

## 4. `useRef` instead of `useState` when no rerender is needed

**Rule.** If a state change shouldn't cause a rerender, use `useRef` instead of `useState`.

**Why.** `useState` triggers reconciliation; `useRef` does not. Using state for values the UI does not read is wasted work.

**How it applies here.**

- Latest-value refs inside stable callbacks.
- Imperative focus, scroll, or third-party instance handles.
- Throwaway timers, request IDs, and previous-value tracking.

---

## 5. Use shadcn/ui as the design system

**Rule.** Use a design system — reusable UI elements without business logic. **In this project the design system is shadcn/ui.**

**Why.** A single, versioned primitive layer gives us consistent visuals, accessibility for free (via Radix under the hood), and a clean separation between UI and business logic.

**How it applies here.**

- All primitives live in `src/components/ui/` and follow the shadcn/ui conventions already established there (`button.tsx`, `input.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, `command.tsx`, `popover.tsx`, `select.tsx`, `tabs.tsx`, `table.tsx`, `tooltip.tsx`, `sonner.tsx`, etc.).
- Rules for shadcn usage:
  - **No competing UI kits.** Do not install MUI, Chakra, Ant, Mantine, or Headless UI. Do not import Radix packages directly inside a feature — consume them through the shadcn primitive in `ui/`.
  - **New primitives arrive via shadcn.** Add them the shadcn way, place them in `src/components/ui/`, and keep the file structure the CLI generates.
  - **`ui/` stays pure.** No i18n, no stores, no feature imports, no business logic.
  - **`common/` composes shadcn primitives** into product patterns (`DataTable`, `PageHeader`, `EmptyState`, `ConfirmDialog`, `TenantSwitcher`, etc.) and may consume stores and i18n.
  - **Features consume `ui/` and `common/`** — never another feature.
  - **Styling only through Tailwind + shadcn tokens + `cn()`** (`src/lib/utils.ts`). No inline `style` for design values.
  - **Icons: `lucide-react` only**, matching shadcn conventions. No emoji.

---

## 6. Keep components small and single-responsibility

**Rule.** Keep components small and single-responsibility.

**Why.** Small components are easier to name, test, review, and reuse. Multi-purpose components accumulate props and branches until they collapse under their own weight.

**How it applies here.**

- Split when a component grows beyond one concern or roughly 200 lines.
- Prefer many small files over one large file — this matches the project prompt.
- Give each new file a name that describes what it is; export only what callers need.

---

## 7. Extract logic to hooks when complexity is high

**Rule.** Extract logic in hooks when complexity is high.

**Why.** Hooks keep components declarative and make logic reusable and testable.

**How it applies here.**

- Repeated `useQuery` bundles, form flows, permission checks, and multi-step interactions move into `src/hooks/` or a feature-local `hooks/` folder.
- Existing examples: `useActiveTenant`, `useDebounce`, `useMediaQuery`, `usePagination`, `usePermissions`.

---

## 8. ESLint / Prettier + strict rules

**Rule.** Use ESLint / Prettier with strict rules.

**Why.** Tooling catches classes of bugs and style drift automatically so reviews focus on design, not formatting.

**How it applies here.**

- Never weaken `eslint.config.js` or `.prettierrc.json` to unblock work — fix the code.
- Never disable a lint rule inline without a comment stating why.
- Run `npm run lint`, `npm run typecheck`, and `npm run build:development` before declaring work done. All three must exit clean.
- Imports use the `@/` alias and follow the import plugin's ordering.

---

## 9. Prefer Suspense

**Rule.** Prefer Suspense.

**Why.** Suspense centralises loading orchestration, avoids per-component spinner spaghetti, and pairs naturally with lazy routes and React Query.

**How it applies here.**

- Lazy-load routes with `React.lazy` and place a shared `Suspense` fallback in `src/app/router.tsx`.
- Prefer Suspense-friendly patterns over ad-hoc `isLoading &&` at the top of every component. Use `LoadingState` inside a boundary rather than sprinkling spinners.

---

## 10. Validate and sanitize user input

**Rule.** Validate and sanitize user input.

**Why.** User input is untrusted. Validation prevents nonsense; sanitisation prevents XSS.

**How it applies here.**

- All forms validate via Zod through `react-hook-form` + `@hookform/resolvers/zod`. Validation schemas are the only source of validation truth.
- Any user-supplied HTML runs through `src/lib/sanitize.ts` (DOMPurify) before render.
- Never use `dangerouslySetInnerHTML` directly.

---

## 11. Validate server input with Zod

**Rule.** Validate server input → **Zod**.

**Why.** The server contract can drift. Zod catches shape breaks at the boundary instead of letting them corrupt the UI or the cache.

**How it applies here.**

- Every API response passes through a Zod schema in `src/features/<name>/schemas.ts` before it reaches the UI or the query cache.
- Untyped JSON never escapes `api.ts`.

---

## 12. Validator-Adaptor pattern

**Rule.** Use the Validator-Adaptor pattern.

**Why.** Validation asserts shape; adaptation converts wire format (snake_case, nullable, legacy fields) into a clean domain model. Keeping them separate keeps both simple.

**How it applies here.**

- The only sanctioned conversion is `validateAndAdapt(rawData, schema, adaptor)` from `src/lib/validatorAdaptor.ts`.
- Raw types (`RawUser`, `RawTenant`, …) stay inside the feature; only domain types are exported.
- Mapping lives in `src/features/<name>/adaptors.ts`.

---

## 13. Reusable UI components

**Rule.** Build reusable UI components.

**Why.** Reuse compounds — every shared component we build well pays back on every future screen.

**How it applies here.**

- If two features need the same UI, promote it to `src/components/common/`.
- If three features need the same primitive, extract it into `src/components/ui/` via shadcn.
- Never copy-paste a component across features.

---

## 14. Scalable component architecture

**Rule.** Maintain a scalable component architecture.

**Why.** A predictable layout means anyone can find, extend, or delete code without archaeology.

**How it applies here.**

- Feature-first layout under `src/features/<name>/` with fixed subfolders:
  - `api.ts` — HTTP entry points using `httpClient`.
  - `schemas.ts` — Zod schemas for raw payloads.
  - `adaptors.ts` — raw → domain conversion.
  - `types.ts` — domain types (exported) and raw types (internal).
  - `pages/` — route-level components.
  - `components/` — feature-local components.
- Cross-feature imports are forbidden. If two features need the same thing, it belongs in `common/`.
- Framework-agnostic helpers live in `src/lib/`, hooks in `src/hooks/`, stores in `src/stores/`.

---

## 15. Accessible, production-ready interfaces

**Rule.** Ship accessible, production-ready interfaces.

**Why.** Accessibility is a baseline requirement, not a polish step. A11y bugs shipped are a11y bugs users hit.

**How it applies here.**

- Menus, dialogs, popovers, sheets, and tooltips come from shadcn/Radix primitives — never hand-rolled.
- Every interactive element has an accessible name (label, `aria-label`, or visible text).
- Colour is never the only signal for state — pair with icon or text.
- No `autoFocus`; manage focus explicitly when needed.
- Keyboard traps and focus rings are delegated to shadcn/Radix — do not override them.

---

## 16. Careful handling while building

**Rule.** While building, carefully handle:

- **Loading states**
- **Empty states**
- **Edge cases**
- **Responsive design**
- **Accessibility**
- **Component reusability**
- **Clean developer experience**

**Why.** These are the details that separate a demo from production. Each of them, skipped, becomes a visible defect.

**How it applies here.**

- **Loading states** — render `LoadingState` on pending queries; never leave a screen blank.
- **Empty states** — render `EmptyState` when a list is empty; explain what to do next.
- **Edge cases** — banned users, missing tenant, expired session, offline, permission-denied, validation failure, and network error each get an explicit branch. `ErrorState` handles the recoverable ones; `SessionExpiredDialog` handles auth.
- **Responsive design** — Tailwind breakpoints, mobile-first, verified at `sm`, `md`, and `lg`.
- **Accessibility** — see section 15.
- **Component reusability** — see section 13.
- **Clean developer experience** — small files, descriptive names, predictable imports, no dead code, no commented-out blocks, no orphaned files after a rename.

---

## 17. Enforcement checklist

Run through this before declaring any feature done:

- [ ] No new `useEffect` unless it wraps a listener or integrates a non-React API.
- [ ] No duplicated state; state count is minimal.
- [ ] `useRef` used where no rerender is needed.
- [ ] All UI composed from shadcn primitives in `ui/` or composites in `common/` — no competing UI kits, no direct Radix imports in features.
- [ ] Server data flows through Zod schema + adaptor via `validateAndAdapt`.
- [ ] Forms validated with Zod; user HTML sanitized via `sanitize.ts`.
- [ ] Loading, empty, and error states all present on data views.
- [ ] Responsive at `sm`, `md`, `lg`; keyboard-navigable; screen-reader labelled.
- [ ] Complex logic extracted into hooks.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build:development` all clean.

---

## Change log

- 2026-07-16 — Initial version.
