# Scan Notes

## Goals
- Capture basic repo health signals quickly.
- Keep execution deterministic with timeouts.
- Make command execution transparent in the output (exit code + duration).

## Current Scanner Signals
- Git dirty status via `git status --porcelain`.
- Test command execution (config-driven).
- Lint command execution (config-driven).

## Next Steps
- Add dependency audit + last commit age.
- Capture stdout/stderr separately for richer reports.
- Persist scan results for weekly summary generation.
