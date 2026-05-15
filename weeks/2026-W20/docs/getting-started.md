# Getting Started

Friday's slice turns the digest into a more scheduler-friendly CLI by pairing the earlier filtered report flow with a bundled artifact command and explicit run-status output.

## Run

```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
go run ./src/cmd/repodigest report --format json --config demos/sample-config.json
go run ./src/cmd/repodigest report --kind github --tag backend --config demos/sample-config.json
go run ./src/cmd/repodigest review --config demos/sample-config.json
go run ./src/cmd/repodigest bundle --config demos/sample-config.json --output-dir demos/generated/daily-run
```

## What changed today

- Added a `bundle` command that writes markdown, JSON, review, and status artifacts in one run.
- Added `run-status.json` output so cron jobs and CI can inspect one stable receipt instead of scraping mixed stdout.
- Added helpers for writing structured JSON artifacts and recording per-file success or failure.
- Refreshed tests around JSON file writes and run-status tracking.
- Added generated examples showing the bundled daily-run directory plus a small status summary note.

## Why this shape

- Schedulers usually want more than one file, but they still need a single success signal.
- A status receipt makes partial failures easier to audit after the fact.
- Keeping markdown, JSON, and review outputs together reduces shell glue in automation.
- Generated demos make it easier to inspect the shape before wiring the command into cron or CI.
