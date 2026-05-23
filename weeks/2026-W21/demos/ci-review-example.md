# Pull Request Architecture Review

Run this check after the service map is generated or updated:

    python src/cli.py analyze demos/problematic-system.json --baseline demos/baseline-report.json --format markdown --output demos/generated-report.md

Review flow:

- Look at the baseline status first.
- Treat introduced high-priority items as blockers.
- Ask for an owner-approved plan when a medium-priority ownership or layer violation is intentionally kept.
- Save the JSON report from an accepted build as the next baseline.

Expected reviewer questions:

- Is the dependency real, or is the service map stale?
- Should this call go through a facade, event, or shared lower-layer abstraction?
- Does the package owner expose a supported API for this use case?
- Did this pull request improve or worsen the baseline?
