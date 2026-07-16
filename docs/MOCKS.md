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

## Going live against the real API

When the backend is ready:

1. Set `VITE_MOCK_API=false` in `.env` and point `VITE_API_BASE_URL` at the
   real host.
2. Delete `src/mocks/`.
3. Remove the small `if (env.mock.api)` block in `src/lib/httpClient.ts`
   (about six lines).
4. Remove the `mock` block from `src/lib/env.ts` and the `VITE_MOCK_API` /
   `VITE_MOCK_PERSIST` entries in `.env` and `src/vite-env.d.ts`.

Nothing else changes: feature `api.ts` files, Zod schemas, adaptors, React
Query keys, permissions, and components are all untouched.
