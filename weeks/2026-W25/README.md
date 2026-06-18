# Weekly Focus - 2026-W25

## Theme
- Local AI trace evaluation for practical engineering review.

## Focus Area
- AI

## Primary Language / Stack
- Python 3.13 standard library, unittest, JSONL fixtures, and markdown/json report output.

## Weekly Goal
- Build a small, dependency-free evaluator that reads prompt/response traces, scores expected-answer coverage, flags risky response patterns, summarizes tool usage, and emits review-friendly artifacts.

## Plan (Mon -> Sun)
- Mon: Define the weekly goal, scoring model, fixtures, report formats, and repo structure.
- Tue: Add JSONL parsing, token overlap scoring, and response risk checks.
- Wed: Add expected-answer coverage and tool-use summaries.
- Thu: Build the first runnable evaluator slice with CLI output, tests, demo traces, and tutorial notes.
- Fri: Add multi-run comparison and regression thresholds.
- Sat: Add richer reviewer guidance and examples for CI usage.
- Sun: Polish docs, edge cases, and final weekly summary.

## Exercises (What to Build)
- A JSONL trace loader that accepts compact AI workflow traces.
- Deterministic scoring for expected-answer coverage and response grounding overlap.
- Risk checks for hallucination-prone phrases, leaked-secret markers, and unsafe automation hints.
- A CLI that writes JSON and markdown reports from the same analysis result.
- Demo fixtures and tutorial notes for running the evaluator locally.

## Tests (What to Validate)
- Tokenization and overlap scoring are stable.
- Risk checks detect unsafe or unverifiable response patterns.
- Trace analysis reports the expected counts, average scores, and tool usage.
- CLI execution writes coherent markdown and JSON artifacts.

## UI Demos (What to Showcase)
- This week uses report artifacts instead of a browser UI. The demo is a markdown report generated from sample traces under `demos/`.

## Repo Structure
- `/src` - implementation package and CLI entry point.
- `/tests` - unittest coverage.
- `/demos` - JSONL input fixture and generated report examples.
- `/docs` - short tutorial/how-to notes.

## Tutorial Notes
- See `docs/local-ai-trace-eval.md` for the local workflow.

## Daily Log
- **Daily Entry - 2026-06-18**
  - **Progress:** Created the W25 AI-week plan and built Thursday's first runnable slice: trace loading, scoring, risk checks, report rendering, CLI output, demo fixture, tests, and tutorial notes.
  - **Exercises Completed:** JSONL evaluator, deterministic scoring, markdown/json reports, unittest coverage.
  - **Tests Run:** `python -m unittest discover -s tests`
  - **UI Demo Notes:** Generated-report demo is represented by `demos/sample_traces.jsonl`; run the CLI to write markdown/json reports.
  - **Tried / Solved / Learned:** Kept the evaluator dependency-free so scheduled automation can run it without environment setup. Simple, explainable checks are more useful than opaque AI confidence scores for code review workflows.

## Tried / Solved / Learned
- AI evaluation utilities should be deterministic first. Model-backed judgment can be layered in later, but the baseline needs to run anywhere.
- Report formats should serve two audiences: JSON for automation and markdown for human review.
