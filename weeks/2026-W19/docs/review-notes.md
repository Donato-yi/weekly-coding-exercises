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

- Add prompt-comparison mode so two run variants can be reviewed side by side.
- Emit machine-readable rule IDs so CI or dashboards can aggregate warning types over time.
- Expand the CLI so reviewers can write markdown and JSON artifacts directly to a chosen output directory.
