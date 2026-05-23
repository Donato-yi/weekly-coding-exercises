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
- Markdown report renderer for pull request review notes
- Baseline comparison for tracking fixed, introduced, and unchanged violations
- Demo fixtures for clean and problematic service maps
- Prioritized remediation plan for turning report findings into review actions

## Tests (What to Validate)
- Valid service maps load into deterministic models
- Missing service references are reported as violations
- Cycles are detected and normalized in stable order
- Forbidden dependency rules catch exact source/target pairs
- Layer-order rules catch domain-to-application shortcuts
- Ownership boundaries catch package internals being reused directly
- CLI emits JSON with nonzero violation counts for problematic fixtures
- Markdown reports include summary counts and violation review notes
- Baseline comparisons classify architecture drift as improved, regressed, mixed, or unchanged
- Remediation plans prioritize stale maps and dependency cycles ahead of softer boundary drift

## UI Demos (What to Showcase)
- JSON architecture report suitable for CI or dashboard ingestion
- Markdown review notes showing how a reviewer would interpret the violation list
- Adoption playbook and pull request review example for applying the checks to a real repository

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
    python src/cli.py analyze demos/problematic-system.json --format markdown --output demos/generated-report.md
    python src/cli.py analyze demos/problematic-system.json --baseline demos/baseline-report.json --output demos/generated-report.json
    python src/cli.py analyze demos/problematic-system.json --baseline demos/baseline-report.json --format markdown --output demos/generated-report.md

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
- **Daily Entry - 2026-05-21**
  - **Progress:** Added Thursday's markdown report renderer so the same analyzer can produce CI JSON and pull-request-friendly review notes.
  - **Exercises Completed:** Implemented `render_markdown_report`, added `--format json|markdown` to the CLI, expanded unit and CLI tests, and documented markdown usage.
  - **Tests Run:** python -m unittest discover -s tests
  - **UI Demo Notes:** Regenerated demos/generated-report.json and added demos/generated-report.md with grouped review notes for each architecture violation.
  - **Tried / Solved / Learned:** The JSON report is best for machines, but reviewers need a compact narrative artifact. Keeping both formats backed by one report model avoids duplicate rule logic.
- **Daily Entry - 2026-05-22**
  - **Progress:** Added Friday's baseline comparison flow so teams can see whether architecture drift improved or worsened against a previous report.
  - **Exercises Completed:** Implemented compare_reports, added CLI --baseline support, included baseline summary rendering in markdown reports, added a baseline demo report, and expanded unit/CLI coverage.
  - **Tests Run:** python -m unittest discover -s tests
  - **UI Demo Notes:** Regenerated demos/generated-report.json and demos/generated-report.md with a baseline comparison that marks one newly introduced missing dependency as a regression.
  - **Tried / Solved / Learned:** A raw violation count is weaker than a comparison. Classifying fixed, introduced, and unchanged findings gives reviewers a better sense of direction without hiding current risk.
- **Daily Entry - 2026-05-23**
  - **Progress:** Added Saturday's richer review layer with prioritized remediation guidance, an adoption playbook, a service-map template, and a pull request review example.
  - **Exercises Completed:** Implemented build_remediation_plan, included remediation output in JSON and markdown reports, expanded unit/CLI coverage, and added docs for applying the checker to a real repository.
  - **Tests Run:** python -m unittest discover -s tests
  - **UI Demo Notes:** Regenerated demos/generated-report.json and demos/generated-report.md so the review artifact now includes baseline status plus suggested remediation actions.
  - **Tried / Solved / Learned:** Teams need more than "pass/fail" from architecture tooling. A ranked action list helps reviewers separate stale maps and cycles from softer boundary cleanup.

## Tried / Solved / Learned
- Rotating from automation to architecture changes the problem from scheduled output reliability to design-boundary clarity.
- Python is a practical fit for this week because the core ideas are graph and rule modeling, and the tests can stay fast without external dependencies.
