# Weekly Focus — 2026-W09

## Theme
- Type‑safe API design + security middleware patterns for JavaScript/TypeScript apps.

## Exercises
- Build a small TypeScript API with request validation (Zod) and versioned routes.
- Add a lightweight rate limiter + bot detection stub to simulate security middleware.

## Tests
- Vitest unit tests for validators, rate limiter behavior, and error shapes.

## UI Demo (if applicable)
- Simple Vite page that sends requests and visualizes rate‑limit headers/responses.

## Tutorial Notes
- Keep SDK interfaces stable; surface breaking changes behind a major version.
- Prefer clear error contracts (problem+json style) for client stability.

## Tried / Solved / Learned
- Tried: splitting routing by version and enforcing per‑route schemas.
- Solved: consistent error response shape across middleware layers.
- Learned: stability guarantees reduce downstream churn more than raw feature count.

## Daily Entry — 2026-02-24

### Exercise(s)
- Drafted a TS API skeleton with Zod schema validation and a basic rate‑limit middleware.

### Tests
- Added unit tests for schema failures, rate‑limit counters, and retry‑after headers.

### Mini Tutorial Summary
- Versioned routes + stable error contracts make client integrations resilient during rapid iteration.

### UI Demo Notes
- Vite page shows request counts and rate‑limit responses in a small dashboard.

### Tried / Solved / Learned
- Tried: using a shared middleware pipeline for all endpoints.
- Solved: separating auth/validation/limit concerns for clearer failure modes.
- Learned: “stable API surface” is a feature worth explicit design time.
