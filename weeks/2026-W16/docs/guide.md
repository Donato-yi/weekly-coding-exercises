# Guide

This week’s exercise treats architecture review as a repeatable coding problem.

## What it does
- Loads a JSON topology of services and dependencies
- Flags unknown dependencies, missing owners, and missing health checks
- Produces a safe deployment order for acyclic graphs
- Computes blast radius by walking reverse dependencies from a focus service
- Ranks service risk with a lightweight policy score so reviewers can triage hotspots first

## Why it matters
A service map is useful, but architecture reviews get more actionable when the graph also encodes who owns each service, whether it exposes a health check, and how much downstream surface area it carries.

## Run it
```bash
python src/cli.py demos/sample_topology.json --focus identity
```

## Test it
```bash
python -m unittest discover -s tests -v
```

## Interpreting policy scores
- `critical`, `core`, and `shared` tiers start with higher baseline weight than edge services.
- Missing owners, missing health checks, and unknown dependencies all increase risk.
- A service with a large blast radius rises naturally because an incident would spread farther.

Use the score as a prioritization hint, not as a replacement for architecture judgment.
