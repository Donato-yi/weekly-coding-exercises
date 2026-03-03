# Weekly Focus — 2026-W10

## Theme
- Automation: local developer task runner with composable steps and logging

## Focus Area
- automation

## Primary Language / Stack
- Go 1.22 (stdlib-only)

## Weekly Goal
- Build a small, reliable task runner that reads a simple YAML/JSON task spec, executes steps, and produces a concise run report suitable for CI/local dev.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Define task schema + config loader + sample spec
- Wed: Implement step runner + command exec + env support
- Thu: Add structured logging + timing + exit summaries
- Fri: Add report output (markdown + json) + docs
- Sat: Add retry/backoff + concurrency controls
- Sun: Refactor + polish + retrospective

## Exercises (What to Build)
- Task spec parser (JSON first, optional YAML later)
- Step execution engine with per-step status
- Report generator (summary + per-step details)

## Tests (What to Validate)
- Config parsing and schema validation
- Step success/failure propagation
- Report formatting and deterministic ordering

## UI Demos (What to Showcase)
- Sample CLI run output + generated markdown report

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep task specs small and explicit; errors should point to the exact failing step.

## Daily Entry — 2026-03-03 (Tue)
- Progress: defined JSON schema structs, loader with strict decoding, and validation checks.
- Exercises completed: initial task spec parser (JSON-only).
- Tests run: Not run (Go toolchain not available in automation environment).
- UI demo notes: sample spec in `/demos/sample-spec.json`.
- Tried / Solved / Learned: `DisallowUnknownFields` helps catch typos early.

## Daily Log
- 2026-03-03: Added schema + loader + sample spec; basic validation and tests.

## Tried / Solved / Learned
- Using strict JSON decoding avoids silent config mistakes.
