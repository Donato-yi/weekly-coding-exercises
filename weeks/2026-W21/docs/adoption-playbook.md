# Adoption Playbook

This playbook shows how to move the architecture fitness checks from demo data into a real repository without turning the first run into noise.

## 1. Map Runtime Services

Start with deployable or independently owned units, not every folder. A useful first map usually has 5-20 services:

- public entrypoints such as web, api, mobile-gateway
- domain services such as orders, inventory, billing
- platform capabilities such as identity, notifications, search
- infrastructure adapters only when teams call them directly

Give each service a `layer`, `package`, and dependency list. Keep the names stable because baseline comparisons use service names to classify fixed and introduced drift.

## 2. Add Rules Gradually

Start with rules the team already believes:

- edge services should call application facades, not domain internals
- domain services should not depend upward on application or edge layers
- product packages should not reach into another package's internals without an owned API

Leave controversial rules out for the first run. A fitness check is more useful when every violation can be defended in review.

## 3. Run In Report Mode

Generate both machine and reviewer artifacts:

    python src/cli.py analyze demos/problematic-system.json --output demos/generated-report.json
    python src/cli.py analyze demos/problematic-system.json --format markdown --output demos/generated-report.md

The JSON report is for CI storage and baseline comparison. The markdown report is for pull request comments or architecture review notes.

## 4. Compare Against A Baseline

Save the first accepted report as a baseline. Future runs can then show whether a change fixed, introduced, or left drift unchanged:

    python src/cli.py analyze demos/problematic-system.json --baseline demos/baseline-report.json --output demos/generated-report.json

Use introduced violations as the first blocking signal. Existing violations can stay visible while teams work them down.

## 5. Act On The Remediation Plan

The remediation plan is intentionally practical rather than magical:

- high priority: stale service maps and dependency cycles
- medium priority: explicit boundary and layering rules
- low priority: unknown or custom rule types

Treat each action as a review prompt. The tool points to the likely fix; the team still owns the design decision.
