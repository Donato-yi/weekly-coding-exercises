# Review Notes

## Why this exercise exists

Agent workflows are getting easier to run and harder to trust at a glance. This toolkit is meant to make a single run legible enough that a human reviewer can answer a few basic questions quickly:

- Did the run succeed cleanly?
- Did it rely on retries?
- Were there approval-gated steps?
- Did it invoke commands that deserve extra scrutiny?
- Is the score bad because of one failure or repeated process issues?

## Current heuristic choices

- Failures cost the most because they usually force direct investigation.
- Retries are cheaper than failures, but repeated retries still indicate fragility.
- Approval-heavy runs are not necessarily bad, but they often signal a workflow that needs clearer boundaries.
- Risky shell patterns deserve a visible warning even if the run completed.

## Suggested next steps

- Add trend summaries across many traces so a team can spot whether quality is improving week over week.
- Emit machine-readable rule IDs so CI or dashboards can aggregate warning types over time.
- Expand the comparison report so it can explain which step-level differences likely caused the score delta.

## Friday update: side-by-side comparison mode

The toolkit can now compare two traces directly:

```bash
node src/cli.mjs demos/sample_trace.json demos/prompt_risky_trace.json --compare
node src/cli.mjs demos/sample_trace.json demos/prompt_risky_trace.json --compare --format both --out-dir demos/generated --output-name comparison-report
```

This helps a reviewer answer a slightly different question from the single-run report: not just "is this run risky?" but "did the new prompt or workflow actually improve anything?"

The current comparison view focuses on:

- score deltas,
- failures, retries, approvals, risky-command counts, and prompt-risk counts,
- newly introduced rule hits in the right-hand run,
- and a short recommendation list when the newer variant regresses.
