# Schedule-friendly output notes

The week now has two output patterns:

- `repodigest report --output ...` for one-off markdown or JSON artifacts
- `repodigest bundle --output-dir ...` for a scheduler-friendly directory of related files plus `run-status.json`

## Single-artifact examples

```bash
go run ./src/cmd/repodigest report --config demos/sample-config.json --output demos/generated/sample-summary.md
go run ./src/cmd/repodigest report --config demos/sample-config.json --format json --output demos/generated/sample-summary.json
go run ./src/cmd/repodigest report --config demos/sample-config.json --risk high --output demos/generated/high-risk-summary.md
go run ./src/cmd/repodigest report --config demos/sample-config.json --tag backend --output demos/generated/backend-summary.md
go run ./src/cmd/repodigest report --config demos/sample-config.json --tag security --format json --output demos/generated/security-summary.json
```

## Bundle example

```bash
go run ./src/cmd/repodigest bundle --config demos/sample-config.json --output-dir demos/generated/daily-run
go run ./src/cmd/repodigest bundle --config demos/sample-config.json --output-dir demos/generated/daily-run --continue-on-error
```

## Why this helps

- keeps scheduled runs easy to inspect after the fact
- avoids shell redirection quirks across environments
- creates parent folders automatically for generated artifacts
- leaves stdout intact for logs and quick terminal review
- adds a stable status receipt that can be checked by cron, CI, or another automation step
- lets one fixture set produce both human-readable and machine-readable artifacts in one pass

## Failure behavior

- `report` exits non-zero on any write failure.
- `bundle` always tries to write `run-status.json` before exiting.
- `bundle --continue-on-error` records per-artifact failures and keeps attempting later writes, then exits non-zero if anything failed.
