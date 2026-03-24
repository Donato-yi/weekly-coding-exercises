# Weekly Focus — 2026-W13

## Theme
- HTMX-powered habit check-ins with server-rendered HTML

## Focus Area
- web

## Primary Language / Stack
- Go + net/http + html/template + HTMX + Tailwind (CDN)

## Weekly Goal
- Build a tiny HTMX app that lets users add + toggle daily habits with server-rendered updates and a clean demo experience.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build in-memory store, handlers, and templates (today)
- Wed: Add better validation + empty-state handling + errors
- Thu: Add docs/tutorial + demo notes
- Fri: Expand tests (edge cases + not-found)
- Sat: Add optional filters (all / done / pending)
- Sun: Refactor + summarize lessons learned

## Exercises (What to Build)
- In-memory habit store with add/toggle actions
- Server-rendered list + item partials
- HTMX form for add + inline toggle buttons

## Tests (What to Validate)
- Add endpoint returns updated list HTML
- Toggle endpoint flips done state and returns updated item markup

## UI Demos (What to Showcase)
- Clean landing view with empty state
- Inline toggle interaction (no full page reload)

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep HTML fragments focused for HTMX swaps.
- Use server-side templates to keep state canonical.
- Treat templates as reusable partials (list + item).

## Daily Log
- **Daily Entry — 2026-03-24**
  - **Progress:** Built the store, handlers, and template partials. Added an HTMX form + toggle flow and wrote initial tests.
  - **Exercises Completed:** In-memory store + add/toggle handlers + list/item templates.
  - **Tests Run:** Not run (requires local Go install).
  - **UI Demo Notes:** Added demo notes covering the empty state + inline toggle flow.
  - **Tried / Solved / Learned:** HTMX swaps are easiest when list and item templates are independently renderable.

## Tried / Solved / Learned
- Keeping handlers small makes HTMX partials easy to wire.
- Structuring templates as `page`, `list`, and `item` keeps swaps consistent.
