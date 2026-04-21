# Demo Notes

## Scenario
A frontend engineer wants a quick way to turn design tokens into reviewable CSS and check whether likely text/surface pairs meet contrast expectations.

## What to run
```bash
node src/cli.mjs demos/sample_tokens.json
```

## What to look for
- Stable CSS variable names for each token
- A concise summary showing pass/warn/fail counts
- A failing warning color pair that should be adjusted before production
