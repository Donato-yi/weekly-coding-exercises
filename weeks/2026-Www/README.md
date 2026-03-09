# Weekly Focus — 2026-W11

## Theme
- Lightweight automation runner CLI: define tasks in YAML, run with retries, and capture structured logs

## Focus Area
- automation

## Primary Language / Stack
- Go 1.22 + Cobra (CLI) + YAML (gopkg.in/yaml.v3)

## Weekly Goal
- Build a small, well-tested CLI that loads a YAML task file, executes commands with timeouts/retries, and writes a JSONL run log for later review.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Implement config schema + YAML parsing + validation
- Wed: Implement task runner with timeout + retry behavior
- Thu: Add JSONL logging + summary output
- Fri: Add docs/tutorial + sample task file
- Sat: Add integration tests + edge cases
- Sun: Review, polish README, and capture lessons learned

## Exercises (What to Build)
- Task schema (name, command, retries, timeout)
- Runner that executes tasks sequentially with clear status output
- JSONL log writer with timestamps and exit codes
- Sample YAML config

## Tests (What to Validate)
- YAML parsing + validation errors
- Timeout handling and retry behavior
- Log output format and required fields

## UI Demos (What to Showcase)
- CLI run output showing task status + summary
- Sample JSONL log snippet

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Go exec.Command with context timeouts
- Designing minimal task schemas for automation

## Daily Log
- **Daily Entry — 2026-03-09**
  - **Progress:** Set weekly goal and plan.
  - **Exercises Completed:** Planned CLI scope and core features.
  - **Tests Run:** N/A
  - **UI Demo Notes:** N/A
  - **Tried / Solved / Learned:** Defined a lean task schema to keep the runner small.

## Tried / Solved / Learned
- A tight schema reduces scope creep and makes testing straightforward.
