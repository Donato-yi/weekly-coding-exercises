# Weekly Focus — 2026-W19

## Theme
- Agent trace review and prompt-evaluation toolkit for AI workflows

## Focus Area
- AI

## Primary Language / Stack
- TypeScript 7.0 Beta + Node.js 22 + lightweight eval/report tooling

## Weekly Goal
- Build a small toolkit that scores agent runs, flags risky tool-use patterns, summarizes prompt/eval traces, and produces review-friendly markdown and JSON artifacts.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build trace schema, parser, scoring model, and starter tests
- Wed: Add prompt-risk heuristics and tool-use warning rules
- Thu: Add markdown/json report generation plus CLI options
- Fri: Add comparison mode for two runs or prompt variants
- Sat: Add demo traces, docs, and review walkthrough notes
- Sun: Refactor, summarize tradeoffs, and capture follow-up ideas

## Exercises (What to Build)
- Trace parser for agent runs with prompts, tool calls, and outcomes
- Heuristic evaluator for latency, retries, failures, and risky tool patterns
- Prompt comparison report for variant A/B review
- CLI that emits human-readable markdown and machine-readable JSON summaries
- Small set of demo traces showing clean, noisy, and failure-prone runs

## Tests (What to Validate)
- Trace parsing is deterministic for sample inputs
- Warning rules trigger on repeated failures, loops, or risky tool combinations
- Score output is stable for the same trace data
- Comparison mode highlights meaningful differences without noisy duplication
- CLI output remains consistent across markdown and JSON formats

## UI Demos (What to Showcase)
- Sample agent trace JSON files
- Generated markdown review report for a single run
- Comparison report for two prompt variants
- Notes on how an engineer could use the toolkit before trusting an automation flow

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- The point is not to create a perfect eval framework, just a small one that makes agent behavior easier to inspect.
- Review artifacts matter because teams trust automation faster when failures are visible and legible.
- Heuristic warnings are most useful when they point to concrete follow-up actions instead of abstract risk labels.
- TypeScript is a good fit here because the data shapes and CLI/report flow should stay explicit and easy to extend.

## Getting Started
```bash
npm test
node src/cli.mjs demos/sample_trace.json
node src/cli.mjs demos/sample_trace.json --format markdown
node src/cli.mjs demos/sample_trace.json --compare demos/sample_trace_variant.json
```

## Daily Log
- **Daily Entry — 2026-05-04**
  - **Progress:** Planned the weekly AI theme, deliverables, report outputs, and the day-by-day build sequence.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** Agent tooling feels more practical when the exercise focuses on inspection and review, not just generation.

## Tried / Solved / Learned
- The useful AI tooling layer is increasingly the observability layer around model behavior.
- A small trace-review CLI can stay concrete while still touching prompts, tools, safety, and developer experience.
