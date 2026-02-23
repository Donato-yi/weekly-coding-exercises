# Weekly Focus — 2026-W09

## Theme
- Build a small, testable HTTP API with strong validation and clear error handling.

## Exercises
- Scaffold a minimal tasks API (CRUD) with explicit request/response schemas.
- Add validation + structured error responses.

## Tests
- Unit tests for handler logic (happy path + validation failures).
- One lightweight integration test for the full request pipeline.

## UI Demo (if applicable)
- N/A (API-only week).

## Tutorial Notes
- Keep handlers thin; push logic into services for easier tests.
- Prefer deterministic fixtures; avoid time-based flakiness.

## Tried / Solved / Learned
- Tried: handler-first vs. service-first scaffolding.
- Solved: validation error shape and consistent HTTP status mapping.
- Learned: a small, well-defined test harness pays dividends fast.

---

## Daily Entry — 2026-02-23

### Exercise(s)
- Created a minimal tasks API skeleton and defined request/response contracts.
- Implemented basic validation with clear error messages.

### Tests
- Added unit tests for create/update handlers (valid + invalid payloads).

### Mini Tutorial Summary
- Keep the API surface small; test the contract before the implementation details.

### UI Demo Notes
- N/A.

### Tried / Solved / Learned
- Tried: table-driven tests for handler cases.
- Solved: consistent error formatting across endpoints.
- Learned: contract-first keeps refactors safer.
