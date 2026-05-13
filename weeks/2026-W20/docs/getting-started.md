# Getting Started

Thursday's slice extends the repo digest from scoring into report generation that can serve both humans and automation.

## Run

```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
go run ./src/cmd/repodigest report --format json --config demos/sample-config.json
go run ./src/cmd/repodigest report --risk high --format markdown --config demos/sample-config.json
```

## What changed today

- Added a `report` command that can emit either markdown or JSON.
- Added `--kind` and `--risk` filters so the same fixture set can produce focused slices.
- Stored applied filters in the summary payload so downstream jobs can audit how an artifact was produced.
- Refreshed tests to cover filtered summary generation and structured JSON rendering.

## Why this shape

- `internal/app` still owns the scoring logic, but now it can produce filtered summaries without duplicating heuristics.
- `internal/model` carries JSON tags and applied-filter metadata so export output stays explicit.
- `src/cmd/repodigest` now behaves more like a real automation CLI with format and filtering flags.
- `demos/generated` includes both a full summary and a high-risk slice, which makes the tool easier to inspect before wiring it into cron or CI.
