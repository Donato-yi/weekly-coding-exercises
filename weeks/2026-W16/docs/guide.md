# Guide

This week’s exercise treats architecture review as a repeatable coding problem.

## What it does
- Loads a JSON topology of services and dependencies
- Flags unknown dependencies, missing owners, and missing health checks
- Produces a safe deployment order for acyclic graphs
- Computes blast radius by walking reverse dependencies from a focus service

## Why it matters
A service map is useful, but architecture reviews get more actionable when the graph also encodes who owns each service and whether it exposes a health check.

## Run it
```bash
python src/cli.py demos/sample_topology.json --focus edge-gateway
```

## Test it
```bash
python -m unittest discover -s tests -v
```
