# Trace Comparison Report

## Runs
- Left: run-2026-05-05-a (v1-reviewer)
- Right: run-2026-05-06-a (v2-risky)

## Scorecard
- Left Score: 41 (high)
- Right Score: 48 (high)
- Score Delta: +7
- Failure Delta: -1
- Retry Delta: -2
- Approval Delta: 0
- Risky Command Delta: 0
- Prompt Risk Delta: +3

## Better Run
- Right run

## New Rule Hits In Right Run
- cmd-permissions
- prompt-ignore-prior
- prompt-bypass-approval
- prompt-secrets

## New Recommendations After Comparison
- Prompt-risk findings increased in the right run, which suggests the new variant needs tighter instruction boundaries.
