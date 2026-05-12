# Getting Started

This Tuesday slice is intentionally small: load a config file, normalize it, and print a markdown summary that later days can enrich with real scoring and export flows.

## Run

```bash
go test ./...
go run ./src/cmd/repodigest summarize --config demos/sample-config.json
```

## Why this shape

- `internal/config` keeps file parsing and validation isolated.
- `internal/app` is where summary and rendering logic can grow without bloating the CLI.
- `demos/` gives fixture-first inputs for the rest of the week.
- `tests/` already locks in the first summary behavior so later scoring work has a stable base.
