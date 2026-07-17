# Mock API layer

While the backend is not ready, every HTTP call the app makes is intercepted
by a local mock layer that returns realistic data. The rest of the app is
completely unaware of it: features call `httpClient.get(...)`, Zod schemas
validate the response, adaptors convert snake_case to camelCase — exactly as
they will against the real API.

## How it works

- `src/lib/httpClient.ts` creates the axios instance and, when
  `VITE_MOCK_API=true`, installs a request interceptor that swaps in
  `mockAdapter` before the request is sent. No feature code changes.
- `src/mocks/adapter.ts` is an axios adapter that parses the outgoing request,
  routes it into `mockRouter`, and returns a synthetic `AxiosResponse` (or a
  synthetic error shaped like an `AxiosError`).
- `src/mocks/router.ts` matches `METHOD + path` against a small route table
  and dispatches to a handler.
- `src/mocks/handlers/*.ts` contain the per-feature logic. They read/write
  `src/mocks/db.ts`, which holds seeded in-memory tables.
- `src/mocks/seeds/*.ts` build the initial data. Everything is generated
  deterministically so lists and IDs are stable across reloads.
- If `VITE_MOCK_PERSIST=true`, mutations (ban, verify, etc.) survive reloads
  via `localStorage` under the `mock.db.v1` key.

## Demo credentials

- `admin` / `admin` — super-admin, no tenant memberships (routes to `/admin`)
- `operator` / `operator` — tenant admin on Luna + moderator on Orbit

## Adding a new endpoint

1. Add a handler function to the matching file under `src/mocks/handlers/`
   (create the file if the feature is new). Handlers return the raw
   snake_case payload that the corresponding Zod schema will parse.
2. Register the route in `src/mocks/router.ts` under the correct HTTP method.
3. Write a Zod schema + adaptor for the feature (already done for existing
   ones) so the response is validated when it reaches the app.
4. If the endpoint mutates data, extend `src/mocks/db.ts` with the update
   method and call `persist()` inside it.

## Using the mocks from tests

Integration tests under `test/integration/` hit **the same** mock adapter without any extra setup. Vitest reads `.env`, so `VITE_MOCK_API=true` activates the adapter for tests exactly as it does in the dev server. Consequences:

- Do not stub `httpClient` or `axios` in tests. Populate the auth store via `signInAs()` (see `test/utils/fixtures.ts`) and let the mock respond.
- The seed credentials from `accounts.ts` (`admin`/`admin`, `operator`/`operator`) are what integration tests should use when exercising the password login form.
- Because handlers throw `AppError` with a real status, integration tests can also exercise the 401 / refresh path without any extra plumbing.

See `docs/TESTING.md` for the full test harness and the four-state contract.

## Going live against the real API

When the backend is ready:

1. Set `VITE_MOCK_API=false` in `.env` and point `VITE_API_BASE_URL` at the
   real host.
2. Delete `src/mocks/`.
3. Remove the small `if (env.mock.api)` block in `src/lib/httpClient.ts`
   (about six lines).
4. Remove the `mock` block from `src/lib/env.ts` and the `VITE_MOCK_API` /
   `VITE_MOCK_PERSIST` entries in `.env` and `src/vite-env.d.ts`.
5. Re-point integration tests that hit named endpoints at a contract-verified
   stub (msw handlers wired in `test/setup.ts`, or a similar seam). Unit tests
   stay untouched because they never crossed the network.

Nothing else changes: feature `api.ts` files, Zod schemas, adaptors, React
Query keys, permissions, and components are all untouched.

> **Supabase note.** When migrating the backend to Supabase (see the project
> Supabase guidance), the same rules apply: the client still hits `httpClient`
> for the app's own endpoints, the mock adapter is deleted, and
> Supabase-facing code lives behind feature `api.ts` files so tests can
> mock the boundary at one place.
