# Prompt Risk Rules

This midweek update adds a thin rule layer on top of the trace evaluator so the toolkit can explain *why* a prompt or tool step deserves human review.

## Prompt-focused rules

- `prompt-ignore-prior`: catches attempts to ignore previous instructions or system guidance.
- `prompt-bypass-approval`: catches language that suggests skipping approval checks.
- `prompt-unbounded-exec`: catches requests for arbitrary shell or script execution.
- `prompt-secrets`: catches requests to print or expose secrets, tokens, credentials, or environment values.

## Command-focused rules

- `cmd-destructive-delete`: destructive filesystem commands.
- `cmd-network-fetch`: outbound fetch or download commands.
- `cmd-permissions`: broad permission changes or elevated-access commands.

## Why this matters

A raw score is useful, but review tools get more practical when they emit stable rule IDs and short explanations. That makes it easier to:

- explain why a run was downgraded,
- compare prompt variants,
- aggregate warning trends later in CI or dashboards,
- and teach safer prompt patterns without reading the whole trace first.
