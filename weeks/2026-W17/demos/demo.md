# Demo Notes

## Scenario
A frontend engineer wants a quick way to turn design tokens into reviewable CSS and check whether likely text/surface pairs meet contrast expectations.

## What to run
```bash
node src/cli.mjs demos/sample_tokens.json
node src/cli.mjs demos/dark_tokens.json --selector '[data-theme="dark"]'
node src/cli.mjs demos/sample_tokens.json --summary-only
```

## What to look for
- Stable CSS variable names for each token
- A concise summary showing pass, warn, and fail counts
- A failing warning color pair that should be adjusted before production
- A dark-theme fixture that cleanly scopes variables to a custom selector
- A summary-only mode that makes quick audit checks less noisy in terminal review
