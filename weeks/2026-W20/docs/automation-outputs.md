# Schedule-friendly output notes

The `repodigest report` command now supports `--output` so a cron job or CI task can both print a report to stdout and persist the same artifact to disk.

## Examples

```bash
go run ./src/cmd/repodigest report --config demos/sample-config.json --output demos/generated/sample-summary.md
go run ./src/cmd/repodigest report --config demos/sample-config.json --format json --output demos/generated/sample-summary.json
go run ./src/cmd/repodigest report --config demos/sample-config.json --risk high --output demos/generated/high-risk-summary.md
```

## Why this helps

- keeps scheduled runs easy to inspect after the fact
- avoids shell redirection quirks across environments
- creates parent folders automatically for generated artifacts
- leaves stdout intact for logs and quick terminal review

## Failure behavior

If the output directory cannot be created or the file cannot be written, the command returns an error and exits non-zero so a scheduler can detect the failure.
