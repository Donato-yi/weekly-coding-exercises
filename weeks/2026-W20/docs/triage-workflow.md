# Review checklist workflow

The `review` command turns the digest summary into a short maintenance checklist.

## Why it exists

JSON is good for automation and dashboards, but a scheduled repo-health job also needs a human-friendly output for quick triage. The review checklist keeps the same scoring rules while reorganizing them into three buckets and adding a deterministic next-step hint for each source:

- **Act now** for high-risk sources
- **Watchlist** for medium-risk sources
- **Healthy** for low-risk sources

## Example

```bash
go run ./src/cmd/repodigest review --config demos/sample-config.json --output demos/generated/review-checklist.md
```

## Suggested use

1. Run `report --format json` when another tool or job needs structured output.
2. Run `review` when a person needs a plain list of what to inspect next.
3. Check off or copy the high-risk items into your sprint or maintenance tracker.
4. Use the `Next step` hint as the default first action, then decide whether the item needs a deeper manual review.

## Notes

- The checklist stays deterministic because it uses the same sorted summary data as the report view.
- The `Next step` guidance is intentionally simple and rule-based so it can stay stable in scheduled runs.
- This output is intentionally markdown-only so it can drop into GitHub, docs, or chat with minimal cleanup.
