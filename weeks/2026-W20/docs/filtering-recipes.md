# Filtering recipes

`repodigest report` can slice the same source list by kind, risk, and tag.

## Common combinations

### Only risky sources

```bash
go run ./src/cmd/repodigest report --config demos/sample-config.json --risk high
```

### Only GitHub repos tagged for backend work

```bash
go run ./src/cmd/repodigest report --config demos/sample-config.json --kind github --tag backend
```

### Security feed as JSON for another job

```bash
go run ./src/cmd/repodigest report --config demos/sample-config.json --tag security --format json --output demos/generated/security-summary.json
```

## Notes

- Filters are combined, not merged loosely. A source must match every provided filter.
- Tags are normalized to lowercase during config loading, so `Backend` and `backend` behave the same.
- The rendered markdown and JSON outputs both include the applied filter metadata for traceability.
