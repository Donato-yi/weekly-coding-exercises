# Weekly Focus — 2026-W15

## Theme
- Repo health automation CLI + weekly report generator

## Focus Area
- automation

## Primary Language / Stack
- Go + Cobra CLI + SQLite + GitHub API

## Weekly Goal
- Build a CLI that scans local repos, summarizes health signals (tests, lint, deps), and generates a weekly markdown report.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Scaffold CLI commands + config schema
- Wed: Implement scanners (git status, test command, lint command)
- Thu: Add dependency audit + changelog summary
- Fri: Report generator (markdown + JSON) + templates
- Sat: Demo walkthroughs + docs
- Sun: Refactor + summarize lessons learned + polish

## Exercises (What to Build)
- CLI commands: `scan`, `report`, `init`
- Health signals: last commit age, test status, lint status, dependency updates
- Markdown report with sections per repo and a summary table

## Tests (What to Validate)
- Unit tests for signal collectors
- Integration test for report generator on sample fixtures

## UI Demos (What to Showcase)
- Sample CLI output
- Example weekly report in /demos

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep config and output schemas versioned for future compatibility.
- Prefer deterministic command execution (timeout + exit code capture).

## Daily Log
- **Daily Entry — 2026-04-06**
  - **Progress:** Planned weekly focus, stack, and milestones.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** The plan should keep command execution deterministic from day one.

## Tried / Solved / Learned
- A tiny CLI with stable output is easier to automate than a large dashboard.
