# Weekly Focus - 2026-W21

## Theme
- Architecture fitness checks for service dependency boundaries

## Focus Area
- architecture

## Primary Language / Stack
- Python 3.13 CLI tooling with dataclasses, deterministic JSON reports, and unittest coverage

## Weekly Goal
- Build a small architecture fitness toolkit that reads a service map, checks dependency rules, detects cycles, and emits review-friendly output for teams that want lightweight design guardrails.

## Plan (Mon -> Sun)
- Mon: Define goal + plan only
- Tue: Build config loading, graph modeling, cycle detection, forbidden dependency checks, CLI output, fixtures, and starter tests
- Wed: Add layer-order rules and package ownership checks
- Thu: Add markdown rendering for architecture review notes
- Fri: Add baseline comparison so teams can track whether drift improved or worsened
- Sat: Add richer demos and docs for applying the checks to a real repository
- Sun: Refactor, summarize tradeoffs, and capture extension ideas for CI integration

## Exercises (What to Build)
- JSON service map parser with clear validation errors
- Directed dependency graph for service-to-service calls
- Cycle detection for architecture drift
- Rule engine for forbidden dependencies
- Layer-order checks for dependencies that point back up the stack
- Package ownership checks for cross-package coupling
- CLI command that writes JSON reports for automation
- Demo fixtures for clean and problematic service maps

## Tests (What to Validate)
- Valid service maps load into deterministic models
- Missing service references are reported as violations
- Cycles are detected and normalized in stable order
- Forbidden dependency rules catch exact source/target pairs
- Layer-order rules catch domain-to-application shortcuts
- Ownership boundaries catch package internals being reused directly
- CLI emits JSON with nonzero violation counts for problematic fixtures

## UI Demos (What to Showcase)
- JSON architecture report suitable for CI or dashboard ingestion
- Short notes showing how a reviewer would interpret the violation list

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Architecture rules should explain the boundary that was crossed, not just fail a build.
- Fitness checks are easier to adopt when they start as reporting tools before becoming hard gates.
- Stable output matters because architecture reports often become pull request artifacts.

## Getting Started
    python -m unittest discover -s tests
    python src/cli.py analyze demos/problematic-system.json
    python src/cli.py analyze demos/problematic-system.json --output demos/generated-report.json

## Daily Log
- **Daily Entry - 2026-05-19**
  - **Progress:** Built the first runnable architecture fitness slice with service-map parsing, dependency graph checks, forbidden dependency rules, cycle detection, JSON report output, fixtures, tests, and tutorial notes.
  - **Exercises Completed:** Added analyze CLI command, clean/problematic demo systems, deterministic report generation, and unittest coverage for parser, graph, rules, and CLI behavior.
  - **Tests Run:** python -m unittest discover -s tests
  - **UI Demo Notes:** Added demos/problematic-system.json and CLI report output so the week starts with a concrete review artifact.
  - **Tried / Solved / Learned:** Lightweight architecture checks work best when they report precise boundary violations first. A small graph model plus explicit rules gives useful signal without requiring a heavyweight platform.
- **Daily Entry - 2026-05-20**
  - **Progress:** Added Wednesday's layer-order and package ownership rules, expanded fixtures with package metadata, and updated the report surface so teams can distinguish explicit bans from structural drift.
  - **Exercises Completed:** Implemented `layer_order` validation, upward dependency detection, `ownership_boundaries` parsing, cross-package dependency checks, and focused tests for both rule families.
  - **Tests Run:** python -m unittest discover -s tests
  - **UI Demo Notes:** Regenerated demos/generated-report.json with five stable violations that cover missing dependencies, forbidden edges, cycles, layer drift, and package ownership drift.
  - **Tried / Solved / Learned:** Layer rules catch direction-of-travel mistakes while ownership rules catch social/API boundary mistakes. Keeping those as separate violation kinds makes the report easier to triage.

## Tried / Solved / Learned
- Rotating from automation to architecture changes the problem from scheduled output reliability to design-boundary clarity.
- Python is a practical fit for this week because the core ideas are graph and rule modeling, and the tests can stay fast without external dependencies.
