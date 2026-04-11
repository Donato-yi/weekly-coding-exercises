# Demo Walkthrough — Repo Health CLI

## Goal
Run the CLI end-to-end and produce a markdown + JSON report you can share with your team.

## Prereqs
- Go installed (1.21+)
- A few repos configured in `docs/config.example.json`

## Steps
1) Initialize a local config file:
   ```bash
   go run ./src init --output docs/config.local.json
   ```

2) Edit `docs/config.local.json` to point at local repos and set test/lint commands.

3) Run a scan:
   ```bash
   go run ./src scan --config docs/config.local.json
   ```

4) Generate reports:
   ```bash
   go run ./src report --config docs/config.local.json --out demos/weekly-report.md --json-out demos/weekly-report.json
   ```

## What To Look For
- Summary counts match the number of configured repos.
- Dirty repo count changes when you add/remove local edits.
- Dependency manifests appear when repos contain `go.mod`, `package.json`, or `requirements.txt`.

## Optional Enhancements
- Capture the scan output and report output into `demos/` for sharing.
- Add screenshots of CLI output if you’re demoing this live.
