# Scheduled bundle workflow

Friday's slice adds a `bundle` command meant for cron jobs and CI steps that need several artifacts from one config run.

## Command

```bash
go run ./src/cmd/repodigest bundle --config demos/sample-config.json --output-dir demos/generated/daily-run
```

## What it writes

- `summary.md` for a quick human scan
- `summary.json` for downstream automation
- `review.md` for action-oriented triage
- `run-status.json` as the scheduler-facing receipt

## Why the status file matters

A scheduled task usually needs one stable place to inspect success or failure. Instead of guessing from mixed stdout, `run-status.json` captures:

- config path
- output directory
- whether `--continue-on-error` was enabled
- per-artifact success or failure
- collected error messages

## Failure handling

If config loading fails, the command still tries to write `run-status.json` into the output directory before exiting non-zero.

If an artifact write fails:

- default behavior: stop on the first failure, write `run-status.json`, exit non-zero
- `--continue-on-error`: keep attempting later artifacts, record every failure, then exit non-zero if any artifact failed

That shape keeps the command cron-friendly without hiding partial failures.
