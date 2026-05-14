# Weekly Focus — 2026-W20

## Theme
- Scheduled repository health and release-digest automation for small engineering teams

## Focus Area
- automation

## Primary Language / Stack
- Go 1.24 CLI tooling with JSON reports, cron-friendly commands, and lightweight GitHub-oriented automation

## Weekly Goal
- Build a small automation toolkit that gathers release notes and repo signals, scores maintenance risk, and emits a markdown plus JSON digest that could plug into a daily or weekly scheduled workflow.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build config loading, release-source models, CLI scaffolding, and starter fixtures/tests
- Wed: Add GitHub repo health scoring for stars, issues, cadence, and stale-signal heuristics from fixture data
- Thu: Add digest rendering for markdown and JSON outputs plus filtering options
- Fri: Add schedule-friendly commands, failure handling, and file output helpers
- Sat: Add richer demo fixtures, docs, and walkthrough notes for extending the pipeline
- Sun: Refactor, summarize tradeoffs, and capture follow-up ideas for real API-backed integrations

## Exercises (What to Build)
- Config-driven source list for repos, changelogs, and release feeds
- Risk and freshness scoring for maintenance signals
- Markdown digest generator for human review
- JSON output for automation pipelines or dashboards
- CLI commands for summarize, render, and export flows
- Demo fixture set that mimics a few healthy, stale, and noisy repos

## Tests (What to Validate)
- Config parsing stays deterministic for valid and invalid input
- Repo-signal scoring responds correctly to stale, noisy, and active fixture data
- Digest output keeps stable ordering and readable summaries
- CLI commands write expected files and exit cleanly on partial failures
- JSON output preserves enough structure for future scheduled integrations
- Combined kind, risk, and tag filters stay deterministic and easy to audit

## UI Demos (What to Showcase)
- Sample markdown maintenance digest
- JSON automation report for downstream jobs
- Fixture-driven examples for healthy versus risky repo states
- Filtered markdown and JSON slices for backend and security-specific review flows
- Notes on how a solo developer or small team could use the tool before planning maintenance work

## Repo Structure
- /src
- /internal
- /tests
- /demos
- /docs

## Tutorial Notes
- Good automation tools earn trust when they degrade gracefully and leave readable artifacts behind.
- A digest is more useful when it explains why something looks risky instead of just assigning a score.
- Fixture-first development makes scheduled tooling easier to test before wiring in real APIs.
- Keeping the Monday scope narrow helps the rest of the week move faster and with less churn.

## Getting Started
```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
go run ./src/cmd/repodigest report --format json --risk high --config demos/sample-config.json
go run ./src/cmd/repodigest review --config demos/sample-config.json
go run ./src/cmd/repodigest report --kind github --tag backend --config demos/sample-config.json
go run ./src/cmd/repodigest report --tag security --format json --output demos/generated/security-summary.json
```

## Daily Log
- **Daily Entry — 2026-05-11**
  - **Progress:** Planned the week 20 automation theme, outputs, CLI shape, scoring model, and day-by-day implementation path.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** Rotating from AI review tooling into automation work keeps the repo honest because the problem shifts from evaluation heuristics to operational reliability.
- **Daily Entry — 2026-05-12**
  - **Progress:** Built the first runnable Go slice with config models, validation, summary rendering, demo fixtures, CLI scaffolding, docs, and starter tests.
  - **Exercises Completed:** Added `summarize` command wiring, fixture-backed config loading, summary aggregation, markdown output, and baseline test coverage.
  - **Tests Run:** `go test ./...`
  - **UI Demo Notes:** Added a generated sample markdown digest under `demos/generated/sample-summary.md` so the future report flow already has a visible artifact.
  - **Tried / Solved / Learned:** Starting with normalized fixture inputs makes the later scoring work safer because the shape of the data is already stable before heuristics get layered on top.
- **Daily Entry — 2026-05-13**
  - **Progress:** Pushed the digest a little further toward real maintenance workflows by adding an action-oriented review output alongside the earlier JSON and filtered report paths.
  - **Exercises Completed:** Added a `review` command that groups high-risk, watchlist, and healthy sources into a markdown checklist, kept `--output` support for saved artifacts, refreshed tests around grouped review rendering, updated README instructions, and generated a reusable maintenance checklist demo.
  - **Tests Run:** Attempted `go test ./...`, but Go is not installed or not on PATH in this environment.
  - **UI Demo Notes:** Added `demos/generated/review-checklist.md` so the week now shows both machine-friendly report output and a human-friendly action list for triage.
  - **Tried / Solved / Learned:** Structured data is useful, but operators often need the next action spelled out plainly. Turning the digest into a checklist makes the same scoring logic easier to use during a quick repo triage session.
- **Daily Entry — 2026-05-14**
  - **Progress:** Tightened the report workflow so one source config can now produce narrower digest slices for different audiences without duplicating fixtures.
  - **Exercises Completed:** Added `--tag` filtering to the CLI and summary model, covered combined kind-risk-tag filtering in tests, documented filter recipes, refreshed getting-started notes, and generated backend-focused markdown plus security-focused JSON demo artifacts.
  - **Tests Run:** Not run here because Go is not installed or not available on PATH in this environment.
  - **UI Demo Notes:** Added `demos/generated/backend-summary.md` and `demos/generated/security-summary.json` to show how the same dataset can drive a human review slice and a machine-friendly downstream payload.
  - **Tried / Solved / Learned:** Filtering becomes much more useful once it lines up with how people actually review maintenance work. Tags are a simple way to create that extra slice without making the config harder to maintain.

## Tried / Solved / Learned
- Weekly rotation is working well when the theme changes both the focus area and the implementation style.
- Automation projects benefit from artifact-first thinking because scheduled jobs are only trustworthy when their outputs are easy to inspect.
- Go feels like a good fit for this week's constraints: small binaries, direct CLI ergonomics, and straightforward test structure.
- The first useful CLI milestone is not smart scoring. It is dependable input handling plus readable output.
- Scoring rules become easier to trust when each penalty leaves a plain-English breadcrumb in the digest.
- Structured JSON plus lightweight filters make the same tool more useful to both humans and scheduled jobs.
- A checklist view is a nice bridge between generated scores and actual maintenance work, because it turns "interesting data" into a concrete review pass.
- Tag-based slices are a good middle ground between one giant report and too many separate config files.
