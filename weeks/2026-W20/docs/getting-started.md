# Getting Started

Wednesday extends the repo digest from simple inventory into fixture-driven health scoring.

## Run

```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
```

## What changed today

- Added per-source maintenance signals for stars, issue backlog, release age, commit freshness, CI status, and open security alerts.
- Scored every source into low, medium, or high risk buckets.
- Rendered a watchlist section so the markdown output explains *why* something looks risky.

## Why this shape

- `internal/config` now validates the new signal fields so bad fixture data fails early.
- `internal/app` owns the scoring rules, risk bucketing, and markdown watchlist.
- `demos/` now includes healthy, watchlist, and high-risk examples.
- `tests/` lock in the new scoring behavior before Thursday's render/export work builds on top of it.
