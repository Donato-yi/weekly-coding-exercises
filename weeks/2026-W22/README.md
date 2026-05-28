# Weekly Focus - 2026-W22

## Theme
- Design-token inspector for accessible interface systems

## Focus Area
- design

## Primary Language / Stack
- TypeScript with Vite, Vitest, CSS custom properties, and a small browser demo

## Weekly Goal
- Build a compact design-system utility that reads token definitions, validates contrast and naming consistency, and presents a usable inspector for designers and engineers reviewing interface foundations.

## Plan (Mon -> Sun)
- Mon: Define goal + plan only
- Tue: Create token schema, parser, validation rules, sample token sets, and starter Vitest coverage
- Wed: Add contrast checking for foreground/background pairs and semantic status colors
- Thu: Build a simple inspector demo that renders swatches, typography samples, and spacing ramps
- Fri: Add exportable audit reports with warnings, failures, and suggested fixes
- Sat: Add documentation for integrating token audits into UI review and pull requests
- Sun: Refactor, tighten edge-case tests, and summarize design tradeoffs

## Exercises (What to Build)
- Token JSON schema for color, typography, spacing, radius, and shadow values
- TypeScript parser that normalizes token input into stable internal models
- Naming consistency checks for semantic, component, and raw scale tokens
- WCAG-oriented contrast checks for selected text/background pairs
- Token audit report with pass, warning, and fail categories
- Browser demo that displays token previews without requiring a full design system
- Documentation that explains how to use token audits during UI implementation reviews

## Tests (What to Validate)
- Valid token files parse into deterministic models
- Missing token fields and unknown categories produce clear validation errors
- Semantic color pairs report contrast pass/fail status consistently
- Naming rules catch mixed casing, ambiguous prefixes, and duplicate aliases
- Report output stays stable enough for pull request review
- Demo fixtures cover both clean and problematic token sets

## UI Demos (What to Showcase)
- Color swatches with contrast results and semantic usage labels
- Typography scale preview with sample text
- Spacing and radius ramps for quick visual comparison
- Audit summary panel that separates failures from advisory warnings

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Design-token checks should explain the practical UI problem behind each warning.
- Contrast validation is strongest when it checks semantic pairs, not isolated colors.
- A useful design tool should make inconsistencies visible before debating style preference.

## Getting Started
    npm install
    npm test
    npm run audit -- demos/clean-tokens.json
    npm run audit -- demos/problematic-tokens.json
    npm run demo

## Daily Log
- **Daily Entry - 2026-05-25**
  - **Progress:** Created the W22 design-week plan only, per Monday automation rules.
  - **Exercises Completed:** Defined the token inspector goal, planned implementation slices, and listed validation, reporting, demo, and documentation targets.
  - **Tests Run:** Not run; Monday is planning only and no code was added.
  - **UI Demo Notes:** Planned a browser demo for swatches, typography, spacing, radius, and audit summaries.
  - **Tried / Solved / Learned:** Rotating from architecture to design keeps the weekly practice close to real product work: constraints need both structural checks and clear visual review surfaces.
- **Daily Entry - 2026-05-26**
  - **Progress:** Built the first runnable TypeScript slice: token parsing, normalization, naming validation, color value checks, duplicate alias detection, CLI audit output, fixtures, docs, and Vitest coverage.
  - **Exercises Completed:** Added src/tokens.ts, src/cli.ts, clean/problematic demo token sets, starter tests, and audit notes.
  - **Tests Run:** npm test
  - **UI Demo Notes:** Added JSON fixtures that will feed Thursday's browser inspector; no rendered UI yet because Tuesday focuses on the model and validation layer.
  - **Tried / Solved / Learned:** Deterministic naming rules make design-token problems concrete early. A small report model gives the future demo a stable data surface instead of tying validation directly to UI rendering.
- **Daily Entry - 2026-05-27**
  - **Progress:** Added contrast-pair auditing for explicit foreground/background pairs and inferred semantic status pairs such as color.status.success.foreground/background.
  - **Exercises Completed:** Implemented WCAG-style contrast ratio calculation, missing-pair validation, AA/AAA warning behavior, expanded clean/problematic fixtures, and documented the pair-based contrast model.
  - **Tests Run:** npm install; npm test
  - **UI Demo Notes:** Fixtures now include body-copy and semantic-status color pairs so Thursday's browser inspector can render swatches with real contrast results instead of placeholder colors.
  - **Tried / Solved / Learned:** Accessibility checks need usage context. A token can be valid hex and still fail once paired with a surface, so the audit model now treats contrast as a relationship between tokens.
- **Daily Entry - 2026-05-28**
  - **Progress:** Built the browser-inspector slice with a tested TypeScript view model and a Vite-served demo.
  - **Exercises Completed:** Added src/inspector.ts, src/browser-demo.ts, demos/inspector.html, inspector tests, and demo launch instructions.
  - **Tests Run:** npm install; npm test
  - **UI Demo Notes:** The demo can switch between clean and problematic fixtures, rendering color swatches, typography samples, spacing and radius ramps, contrast cards, and audit issue rows from the same audit data used by the CLI.
  - **Tried / Solved / Learned:** A small view-model layer keeps the UI honest: the demo remains visual, but the grouping and contrast status logic are still covered by unit tests.

## Tried / Solved / Learned
- After architecture boundary checks in W21, design-token inspection is a natural next step because it turns UI foundations into something reviewable and testable.
- TypeScript fits this week because design tokens often feed web interfaces, build tools, and frontend tests.
- The first implementation slice should stay boring and testable: parse data, normalize paths, and produce a stable audit report before adding visuals.
- Browser demos are more useful when they reuse the same audit model as the CLI; otherwise the visual layer can drift from automated review behavior.
