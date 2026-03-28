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
- **Daily Entry — 2026-03-25**
  - **Progress:** Added validation + error handling for add requests (empty, duplicate, length). Updated templates to render a banner while keeping list state.
  - **Exercises Completed:** ListData model, error banner markup, duplicate checks in the store.
  - **Tests Run:** Not run (requires local Go install).
  - **UI Demo Notes:** Error banner appears without losing the list state.
  - **Tried / Solved / Learned:** Returning list HTML on errors keeps HTMX swaps simple.
- **Daily Entry — 2026-03-26**
  - **Progress:** Added a short tutorial doc covering HTMX swap targets + partial templates. Refined demo notes to call out the swap strategy and error flow.
  - **Exercises Completed:** Documented page/list/item template layering and swap targets.
  - **Tests Run:** Not run (requires local Go install).
  - **UI Demo Notes:** Callouts now explain which fragments are swapped on add vs. toggle.
  - **Tried / Solved / Learned:** Writing a swap map (page vs. list vs. item) keeps HTMX flows predictable.
- **Daily Entry — 2026-03-27**
  - **Progress:** Expanded server tests to cover not-found routes, invalid IDs, and method checks.
  - **Exercises Completed:** Added edge-case tests for toggle paths + HTTP methods.
  - **Tests Run:** Not run (requires local Go install).
  - **UI Demo Notes:** No UI changes today.
  - **Tried / Solved / Learned:** Negative-path tests (bad IDs, wrong methods) lock in handler contracts.
- **Daily Entry — 2026-03-28**
  - **Progress:** Added list filters (all/pending/done) with HTMX swaps and updated templates to preserve filter state on add/errors.
  - **Exercises Completed:** Filtered store list, HX-only list rendering, UI filter pills, and filter tests.
  - **Tests Run:** Not run (requires local Go install).
  - **UI Demo Notes:** Filter pills now swap the list in place; empty states explain when a filter has no items.
  - **Tried / Solved / Learned:** Keeping a hidden filter state + hx-include avoids rewriting the add form.

## Tried / Solved / Learned
- Keeping handlers small makes HTMX partials easy to wire.
- Structuring templates as `page`, `list`, and `item` keeps swaps consistent.
- Rendering validation errors in the list partial keeps the UI reactive without extra client logic.
- Negative-path tests (404/400/405) protect the HTMX contract for error cases.
- HTMX filter swaps stay simple when the list partial owns the filter state.
