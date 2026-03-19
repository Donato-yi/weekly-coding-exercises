# Weekly Focus — 2026-W12

## Theme
- Design tokens → CSS variables toolkit for lightweight UI theming

## Focus Area
- design

## Primary Language / Stack
- TypeScript + Node.js (tsx) + node:test

## Weekly Goal
- Build a tiny, typed design‑token library that outputs CSS variables, supports theme overrides, and includes tests + a usage demo.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Define token schema + validation helpers
- Wed: Implement generator + tests + demo
- Thu: Add docs/tutorial + usage examples (today)
- Fri: Add theme presets + edge‑case tests
- Sat: Add integration demo (HTML/CSS snippet) + polish docs
- Sun: Review, refactor, and summarize lessons learned

## Exercises (What to Build)
- Token schema (colors, spacing, radius, typography)
- Theme merge/override utility
- CSS variables serializer
- Helper to emit a CSS variable map for easier tooling

## Tests (What to Validate)
- Theme overrides merge correctly
- CSS variable output is stable and contains expected keys
- CSS variable map exposes all token keys

## UI Demos (What to Showcase)
- Example CSS vars block + component usage snippet
- Light/dark theme override example

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Design tokens as the single source of truth
- When to use CSS variables vs. direct styles
- Prefer scoped selectors for theme switching (data attributes)

## Daily Log
- **Daily Entry — 2026-03-18**
  - **Progress:** Implemented token schema, theme merge, CSS var serialization. Added tests and a usage demo.
  - **Exercises Completed:** Token map + override merge + CSS vars output.
  - **Tests Run:** `npm test`
  - **UI Demo Notes:** Included a sample CSS vars block and button usage snippet.
  - **Tried / Solved / Learned:** Keeping token keys flat makes CSS var naming predictable.
- **Daily Entry — 2026-03-19**
  - **Progress:** Added CSS variable map helper, expanded docs with theme override guidance, and added a light/dark example demo.
  - **Exercises Completed:** toCssVarMap helper + updated docs/tutorial.
  - **Tests Run:** `npm test`
  - **UI Demo Notes:** Added a themed example using `[data-theme]` scoping.
  - **Tried / Solved / Learned:** Scoped selectors keep theme overrides from leaking across components.

## Tried / Solved / Learned
- Flat token keys keep CSS var names consistent and easy to grep.
- Scoped selectors (`[data-theme="dark"]`) make switching safe and predictable.
