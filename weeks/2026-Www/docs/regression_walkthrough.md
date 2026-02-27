# Regression Snapshot Walkthrough

## Goal
Keep a stable markdown report snapshot for a JSONL fixture and fail CI if the report changes unexpectedly.

## 1) Generate a fresh snapshot
```bash
python -m src.eval_runner docs/sample_cases.jsonl --min-score 6 --out demos/report.md --snapshot demos/regression_snapshot.md --update-snapshot
```

## 2) Verify future runs
```bash
python -m src.eval_runner docs/sample_cases.jsonl --min-score 6 --snapshot demos/regression_snapshot.md
```

## 3) When changes are intentional
Re-run with `--update-snapshot` and review the updated snapshot before committing.

## Tips
- Keep fixtures small and explicit.
- Use one snapshot per rubric or dataset.
- Pair snapshots with unit tests for individual criteria.
