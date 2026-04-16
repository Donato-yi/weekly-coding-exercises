# Weekly Focus — 2026-W16

## Theme
- Architecture-focused service topology planner and resilience review kit

## Focus Area
- architecture

## Primary Language / Stack
- Python 3.13 + dataclasses + pytest + JSON CLI

## Weekly Goal
- Build a small toolkit that models service dependencies, validates topology health, and surfaces rollout order plus blast-radius insights for architecture reviews.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Model services, dependencies, and validation rules
- Wed: Add rollout ordering + cycle detection
- Thu: Add blast-radius analysis, CLI reporting, docs, and tests
- Fri: Add policy scoring and richer examples
- Sat: Add demo walkthrough + architecture review scenarios
- Sun: Refactor, summarize tradeoffs, and capture next steps

## Exercises (What to Build)
- JSON-driven service topology parser
- Dependency graph validator with cycle detection
- Rollout-order planner for safe deployment sequencing
- Blast-radius report for selected services

## Tests (What to Validate)
- Cycle detection catches invalid graphs
- Rollout ordering stays deterministic for valid graphs
- Blast-radius output includes downstream dependents
- Warnings are emitted for missing owners or health checks

## UI Demos (What to Showcase)
- Sample topology JSON
- Example CLI output for a healthy topology
- Notes on how to use the report in an architecture review

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep topology input human-readable so architecture discussions do not depend on a heavy UI.
- Prefer deterministic graph output because reviews are easier when ordering does not change between runs.
- Pair dependency graphs with ownership and health-check metadata to make risk more actionable.

## Getting Started
```bash
pytest
python src/cli.py demos/sample_topology.json --focus edge-gateway
```

## Daily Log
- **Daily Entry — 2026-04-13**
  - **Progress:** Planned the weekly architecture theme, deliverables, and the core graph-analysis workflow.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** Architecture exercises feel more concrete when they produce an artifact a team could actually review.
- **Daily Entry — 2026-04-16**
  - **Progress:** Implemented topology parsing, cycle detection, rollout ordering, blast-radius analysis, a small CLI, docs, demo input, and pytest coverage.
  - **Exercises Completed:** Core graph engine, architecture warnings, CLI report path, and example review materials.
  - **Tests Run:** `pytest`
  - **UI Demo Notes:** Added a sample topology plus expected CLI output in `/demos`.
  - **Tried / Solved / Learned:** Ownership and health-check gaps often matter just as much as the graph shape itself.

## Tried / Solved / Learned
- Graph tooling becomes more useful when it mixes structural checks with simple operational metadata.
- Blast radius is easier to reason about when you traverse reverse dependencies instead of eyeballing diagrams.
- A tiny CLI plus JSON fixtures is enough to create a repeatable architecture-review exercise.
