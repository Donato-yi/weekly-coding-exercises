# Weekly Focus - 2026-W23

## Theme
- Server-rendered web workflows for small operational tools

## Focus Area
- web

## Primary Language / Stack
- Go 1.24 with net/http, html/template, SQLite, HTMX, and focused integration tests

## Weekly Goal
- Build a compact server-rendered issue triage board that supports filtering, status updates, lightweight persistence, and progressive enhancement without a heavy frontend build pipeline.

## Plan (Mon -> Sun)
- Mon: Define goal + plan only
- Tue: Create Go module, issue model, SQLite schema, seed data, list/filter handlers, and starter tests
- Wed: Add HTMX status transitions, optimistic partial updates, validation, and handler-level tests
- Thu: Add keyboard-friendly templates, accessible controls, and a no-JavaScript fallback path
- Fri: Add import/export commands for JSON issue snapshots and regression tests for persistence
- Sat: Add demo notes, screenshots or HTML captures, and a short tutorial for extending the board
- Sun: Refactor boundaries, tighten error handling, run the full test suite, and summarize tradeoffs

## Exercises (What to Build)
- Go HTTP server with clear route registration and dependency injection for storage
- SQLite-backed issue repository with deterministic seed data
- HTML templates for issue list, filters, detail rows, and status controls
- HTMX partial responses for status changes and filter updates
- JSON import/export commands for moving issue snapshots between environments
- Documentation that explains when a server-rendered stack beats a SPA for internal tools

## Tests (What to Validate)
- Issue repository creates, lists, filters, and updates records deterministically
- HTTP handlers return correct status codes, templates, and validation errors
- HTMX requests receive partial fragments while ordinary requests receive full pages
- JSON import/export round trips preserve issue data
- No-JavaScript fallback routes keep the same behavior as enhanced controls

## UI Demos (What to Showcase)
- Triage board with status filters, priority labels, and owner assignment
- Inline status updates that replace a single row through HTMX
- Plain form fallback for the same status update workflow
- Demo notes comparing full-page and partial-response behavior

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Server-rendered tools can still feel fast when partial responses are designed around real workflow boundaries.
- Go's standard library is enough for a small internal web app if storage and handlers stay cleanly separated.
- HTMX should enhance ordinary links and forms instead of creating a second application model.

## Getting Started
    go test ./...
    go run ./src

## Daily Log
- **Daily Entry - 2026-06-01**
  - **Progress:** Created the W23 web-week plan only, per Monday automation rules.
  - **Exercises Completed:** Defined the Go + HTMX triage board goal, implementation slices, tests, demos, and documentation targets.
  - **Tests Run:** Not run; Monday is planning only and no code was added.
  - **UI Demo Notes:** Planned a server-rendered triage board with progressive HTMX updates and no-JavaScript fallbacks.
  - **Tried / Solved / Learned:** Rotating from design to web keeps the practice grounded in everyday product workflows, while switching from TypeScript to Go avoids repeating last week's stack.

## Tried / Solved / Learned
- A useful web exercise should force the boundary between app behavior and frontend polish: templates, handlers, persistence, tests, and a small enhancement layer all need to agree.
