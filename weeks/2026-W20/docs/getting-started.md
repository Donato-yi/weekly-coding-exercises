# Getting Started

Thursday's slice makes the digest output more usable for scheduled automation by adding richer filtering around the existing markdown and JSON report flow.

## Run

```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
go run ./src/cmd/repodigest report --format json --config demos/sample-config.json
go run ./src/cmd/repodigest report --risk high --format markdown --config demos/sample-config.json
go run ./src/cmd/repodigest report --kind github --tag backend --config demos/sample-config.json
```

## What changed today

- Added a `--tag` filter so report output can be narrowed to a topic slice without duplicating config files.
- Kept the existing `--kind` and `--risk` filters, and now record all applied filters in the exported summary payload.
- Refreshed tests to cover combined kind, risk, and tag filtering plus JSON output metadata.
- Added generated examples showing a backend-focused markdown digest and a security-focused JSON slice.

## Why this shape

- A scheduler often wants one config file but several artifact views. Tag filtering makes that cheap.
- Keeping filters in the summary payload makes generated files easier to audit later.
- The CLI stays small, but it now supports more realistic daily and weekly reporting workflows.
- Generated demos make it easier to inspect focused slices before wiring the command into cron or CI.
