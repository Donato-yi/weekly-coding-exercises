# Weekly Focus — 2026-W09

## Theme
- AI eval harness: rubric scoring + regression tests for model responses

## Focus Area
- AI

## Primary Language / Stack
- Python 3.11 (stdlib-only)

## Weekly Goal
- Build a lightweight evaluation runner that scores responses against rubric criteria, produces a compact report, and is testable via JSONL fixtures.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Scaffold project layout and sample fixtures
- Wed: Implement rubric scoring + evaluation runner + tests
- Thu: Add CLI flags (min score, fail-fast) + richer report
- Fri: Add regression snapshots + docs walkthrough
- Sat: Add more rubric types (length, structure, refusal checks)
- Sun: Refactor + polish + retrospective

## Exercises (What to Build)
- JSONL-driven evaluator for prompt/response pairs
- Keyword-based rubric scoring with weighted criteria
- Report generator (per-case + summary)

## Tests (What to Validate)
- Criteria matching adds expected weights
- Case-level scoring + summary aggregation
- JSONL parsing works for multiple cases

## UI Demos (What to Showcase)
- Demo report markdown (docs + demos)

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Rubrics make qualitative evaluation reproducible; keep criteria small and explicit.

## Daily Log

### Daily Entry — 2026-02-25

#### Progress
- Implemented rubric scoring and evaluation runner.
- Added sample JSONL fixture and demo report.

#### Exercises Completed
- Keyword-weighted rubric scoring.
- JSONL evaluation loop with summary stats.

#### Tests Run
- Added pytest coverage for rubric scoring and runner output.

#### UI Demo Notes
- Generated a sample report from the fixture.

#### Tried / Solved / Learned
- Small, explicit criteria lists reduce ambiguous scoring drift.

### Daily Entry — 2026-02-26

#### Progress
- Added CLI flags for min-score thresholds and fail-fast behavior.
- Expanded report output with pass/fail counts and per-criterion weights.

#### Exercises Completed
- Implemented pass/fail tracking in the evaluation runner.
- Updated markdown report formatting to include thresholds and status.

#### Tests Run
- Added coverage for min-score and fail-fast behavior.

#### UI Demo Notes
- Refreshed the demo report to reflect the new report format.

#### Tried / Solved / Learned
- Small pass/fail thresholds make rubric scores easier to operationalize in CI.

### Daily Entry — 2026-02-27

#### Progress
- Added regression snapshot checks for markdown reports.
- Wrote a walkthrough doc for snapshot usage in CI.

#### Exercises Completed
- Implemented snapshot compare/update helper.
- Added snapshot CLI flags in the eval runner.

#### Tests Run
- Added unit tests for snapshot update/mismatch handling.

#### UI Demo Notes
- Added a baseline regression snapshot alongside the demo report.

#### Tried / Solved / Learned
- Snapshot tests make scoring regressions obvious without bloating unit tests.

### Daily Entry — 2026-03-01

#### Progress
- Added criteria coverage summaries to eval reports.
- Updated demo and regression snapshot outputs to match new report format.

#### Exercises Completed
- Implemented per-criterion hit counts in the evaluator.
- Exposed coverage section in the markdown report.

#### Tests Run
- Extended evaluator summary tests for coverage counts.

#### UI Demo Notes
- Coverage section highlights which rubric criteria appear across cases.

#### Tried / Solved / Learned
- Coverage summaries make it easier to spot missing rubric signals quickly.

## Tried / Solved / Learned
- Default rubrics should stay small; scale with multiple focused rubrics rather than one giant list.
