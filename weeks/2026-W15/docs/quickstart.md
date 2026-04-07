# Quickstart

```bash
# Initialize a local config
repo-health init --output docs/config.local.json

# Run a placeholder scan
repo-health scan --config docs/config.example.json

# Generate a placeholder report
repo-health report --config docs/config.example.json --out demos/weekly-report.md
```

Notes:
- Update paths to your local repos.
- The scan/report commands are stubs today; they will be wired up across the week.
