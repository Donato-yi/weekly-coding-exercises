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

## Getting Started
```bash
# Run the CLI (placeholder scaffold)
go run ./src --help

go run ./src init --output docs/config.local.json

go run ./src scan --config docs/config.example.json

go run ./src report --config docs/config.example.json --out demos/weekly-report.md --json-out demos/weekly-report.json

# Run tests

go test ./...
```

## Daily Log
- **Daily Entry — 2026-04-06**
  - **Progress:** Planned weekly focus, stack, and milestones.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** The plan should keep command execution deterministic from day one.
- **Daily Entry — 2026-04-07**
  - **Progress:** Scaffolded Cobra CLI (init/scan/report), added JSON config schema + example config, and wrote stub report generator.
  - **Exercises Completed:** Basic command wiring, config loader, starter report writer, and demo output.
  - **Tests Run:** Not run (Go toolchain not available in environment).
  - **UI Demo Notes:** Added placeholder CLI output in `/demos/cli-output.txt`.
  - **Tried / Solved / Learned:** Keeping config JSON-first simplifies validation and makes it easy to evolve into a schema-driven UI.
- **Daily Entry — 2026-04-08**
  - **Progress:** Implemented scanner utilities (git status parsing + command runner with timeouts) and wired the scan command to emit per-repo results.
  - **Exercises Completed:** Added git/test/lint signal collection helpers, scan result struct, and sample scan output demo.
  - **Tests Run:** Not run (Go toolchain not available in environment).
  - **UI Demo Notes:** Added `/demos/scan-output.txt` with a representative scan run.
  - **Tried / Solved / Learned:** Keep scanner functions pure (parse/split) so they’re easy to test without shelling out.
- **Daily Entry — 2026-04-09**
  - **Progress:** Added dependency audit + changelog summary signals to scans and reports, plus docs and demo outputs.
  - **Exercises Completed:** Implemented lightweight dependency detection (go.mod/package.json/requirements.txt), git log summarizer, and report enrichment.
  - **Tests Run:** Not run (Go toolchain not available in environment).
  - **UI Demo Notes:** Added `/demos/dependency-audit.txt` and `/demos/changelog-summary.txt`.
  - **Tried / Solved / Learned:** Low-friction heuristics provide useful signal without adding heavy tooling.
- **Daily Entry — 2026-04-10**
  - **Progress:** Refactored report generation into structured data, added JSON export, and wired the command to emit markdown + JSON outputs.
  - **Exercises Completed:** Added report models/renderers, report templates (md/json), and sample report demos.
  - **Tests Run:** Not run (Go toolchain not available in environment).
  - **UI Demo Notes:** Added `/demos/weekly-report.md` and `/demos/weekly-report.json`.
  - **Tried / Solved / Learned:** Keeping report data separate from rendering makes it easy to add new output formats.

## Tried / Solved / Learned
- A tiny CLI with stable output is easier to automate than a large dashboard.
- Keeping parsing logic separate from command execution makes scanners easier to test.
