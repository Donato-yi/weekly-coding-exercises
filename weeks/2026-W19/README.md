# Weekly Focus — 2026-W19

## Theme
- Agent trace review and prompt-evaluation toolkit for AI workflows

## Focus Area
- AI

## Primary Language / Stack
- Node.js 22 ESM with TypeScript-style modules and zero-dependency test tooling

## Weekly Goal
- Build a small toolkit that scores agent runs, flags risky tool-use patterns, summarizes prompt/eval traces, and produces review-friendly markdown and JSON artifacts.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build trace schema, parser, scoring model, CLI, demo traces, and starter tests
- Wed: Add prompt-risk heuristics and tool-use warning rules
- Thu: Add markdown/json report generation plus richer CLI options
- Fri: Add comparison mode for two runs or prompt variants
- Sat: Add more demo traces, docs, and review walkthrough notes
- Sun: Refactor, summarize tradeoffs, and capture follow-up ideas

## Exercises (What to Build)
- Trace parser for agent runs with prompts, tool calls, and outcomes
- Heuristic evaluator for latency, retries, failures, approval-required steps, and risky tool patterns
- Markdown and JSON report generation
- CLI that emits review artifacts from a single trace file
- Small set of demo traces showing clean, approval-heavy, and failure-prone runs

## Tests (What to Validate)
- Trace parsing is deterministic for sample inputs
- Warning rules trigger on repeated failures, risky commands, and approval-heavy runs
- Score output stays stable for the same trace data
- CLI output remains coherent for both markdown and JSON formats
- Summary metrics correctly count tools, retries, failures, and approval events

## UI Demos (What to Showcase)
- Sample trace JSON files under `/demos`
- Generated markdown report for a single run
- Generated JSON summary for automation pipelines
- Notes on how an engineer could use the toolkit before trusting an agent workflow

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- The point is not a perfect eval framework. It is a compact review loop that makes agent behavior easier to inspect.
- Review artifacts matter because teams trust automation faster when failure modes are legible.
- Heuristic warnings are most useful when they point to follow-up actions instead of vague risk labels.
- Keeping the first drop dependency-light makes it easier to run anywhere Node 22 is already available.

## Getting Started
```bash
node --test tests/*.test.mjs
node src/cli.mjs demos/sample_trace.json
node src/cli.mjs demos/sample_trace.json --format json
```

## Daily Log
- **Daily Entry — 2026-05-04**
  - **Progress:** Planned the weekly AI theme, deliverables, report outputs, and the day-by-day build sequence.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** Agent tooling feels more practical when the exercise focuses on inspection and review, not just generation.
- **Daily Entry — 2026-05-05**
  - **Progress:** Implemented the first runnable toolkit slice: trace parsing, heuristic scoring, markdown/JSON report generation, a CLI, demo traces, docs, and starter tests.
  - **Exercises Completed:** Built summary metrics, warning detection, action recommendations, sample artifacts, and a zero-dependency Node test suite.
  - **Tests Run:** `node --test tests/*.test.mjs`
  - **UI Demo Notes:** Added generated markdown and JSON review artifacts under `/demos/generated` so the workflow already feels like a small internal eval dashboard.
  - **Tried / Solved / Learned:** Good agent review tooling is less about fancy scoring and more about making retries, failures, approvals, and risky commands visible at a glance.

## Tried / Solved / Learned
- Useful AI tooling is increasingly the observability layer around model behavior.
- A small trace-review CLI can stay concrete while still touching prompts, tools, safety, and developer experience.
- Dependency-light exercises move faster because the friction is in the heuristics, not the package manager.
- Approval-heavy runs deserve explicit review because successful completion can still hide process risk.
