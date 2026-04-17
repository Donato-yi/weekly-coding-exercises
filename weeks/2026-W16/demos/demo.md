# Demo Notes

- Use `sample_topology.json` as a small architecture review fixture with a couple of intentional policy gaps.
- Run the CLI with `--focus identity` to see the widest blast radius and the richest policy-score output.
- Notice how `payments` and `notifications` bubble up because they combine tier weight with missing operational metadata.
- In a real team setting, add latency budgets, datastore dependencies, rollback policies, and SLO ownership next.
