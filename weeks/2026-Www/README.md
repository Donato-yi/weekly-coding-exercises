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

## Tried / Solved / Learned
- Default rubrics should stay small; scale with multiple focused rubrics rather than one giant list.
