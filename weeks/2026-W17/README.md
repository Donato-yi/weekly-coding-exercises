# Weekly Focus — 2026-W17

## Theme
- Design-token accessibility toolkit for generating theme variables and contrast audits

## Focus Area
- design

## Primary Language / Stack
- JavaScript (Node.js 22) + design tokens + CSS variable generation

## Weekly Goal
- Build a small toolkit that turns nested design tokens into CSS variables, audits theme contrast, and produces demo-ready output for UI design reviews.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build token flattener, CSS variable generator, contrast audit, and starter tests
- Wed: Add semantic token aliases and richer warnings
- Thu: Add CLI ergonomics and demo fixtures
- Fri: Add export modes and docs polish
- Sat: Add design review checklist and more examples
- Sun: Refactor, summarize tradeoffs, and capture follow-up ideas

## Exercises (What to Build)
- Token flattener for nested JSON theme data
- CSS variable generator for colors, spacing, radius, and typography tokens
- Contrast audit that flags pairs below WCAG-inspired thresholds
- CLI that prints CSS and audit summaries from a sample theme file
- Semantic alias support for component-level tokens like buttons and banners

## Tests (What to Validate)
- Nested tokens flatten into stable variable names
- CSS output includes expected variables and selector scopes
- Contrast checks flag low-contrast pairs and pass safe combinations
- CLI summary is deterministic for the sample fixture
- Semantic aliases resolve correctly and broken aliases surface as warnings

## UI Demos (What to Showcase)
- Sample token JSON for a light marketing/dashboard theme
- Generated `:root` CSS variable block
- Contrast report showing pass/warn/fail pairs
- Notes on how a designer or frontend engineer could use the output in review
- Example semantic tokens for buttons and banners

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep the token schema simple so it can come from Figma exports or hand-written JSON.
- Prefer stable variable naming because churn in design tokens spreads quickly across UI codebases.
- Accessibility checks are more useful when they explain why a pair failed instead of just returning a boolean.
- Semantic aliases help teams review component intent without losing the raw palette beneath it.

## Getting Started
```bash
node --test tests/*.test.mjs
node src/cli.mjs demos/sample_tokens.json
```

## Daily Log
- **Daily Entry — 2026-04-21**
  - **Progress:** Implemented the initial design-token toolkit, including flattening, CSS generation, contrast auditing, a CLI, docs, and demo fixtures.
  - **Exercises Completed:** Core token parser, theme CSS output, contrast report, sample design-tokens fixture, and Node-based unit tests.
  - **Tests Run:** `node --test tests/*.test.mjs`
  - **UI Demo Notes:** Added a sample light theme and generated CSS/audit output in `/demos` for quick review.
  - **Tried / Solved / Learned:** Design tooling gets much more actionable when the token export and accessibility feedback live in the same tiny loop.
- **Daily Entry — 2026-04-22**
  - **Progress:** Added semantic component aliases, token warning inspection, richer CLI output, and expanded tests around alias resolution.
  - **Exercises Completed:** Semantic button/banner tokens, dangling-alias detection, warning output in the CLI, docs refresh, and updated demo fixtures.
  - **Tests Run:** `node --test tests/*.test.mjs`
  - **UI Demo Notes:** The sample now shows component-level aliases like `semantic.button.primary.bg` and intentionally includes one broken alias to demonstrate warning output.
  - **Tried / Solved / Learned:** Semantic design tokens are much easier to review when the tooling can bridge component intent back to the base palette automatically.

## Tried / Solved / Learned
- Token naming discipline matters because every variable becomes a public API for the UI.
- A tiny contrast audit catches issues early without forcing a full design system platform.
- JSON fixtures plus CLI output make design review artifacts easy to version and compare.
- Semantic aliases improve readability, but they need explicit validation or they quietly become broken CSS contracts.
