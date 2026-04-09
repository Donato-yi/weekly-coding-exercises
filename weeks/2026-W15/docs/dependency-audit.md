# Dependency Audit + Changelog Summary

This week’s CLI adds lightweight dependency and changelog signals during scans and report generation.

## Dependency Audit

Heuristics (ordered):
- `go.mod` → counts direct `require` entries
- `package.json` → counts `dependencies` + `devDependencies`
- `requirements.txt` → counts non-empty, non-comment lines
- `pyproject.toml` → notes presence for manual review

Output sample:
```
- deps: npm (direct=14, dev=6)
```

## Changelog Summary

Uses `git log --since=7.days --pretty=format:%s` to summarize recent commits.

Output sample:
```
- changelog: 4 commits (last 7 days)
  - feat: add dependency audit
  - fix: report formatting
  - docs: add audit notes
```

## Notes

- Errors are surfaced in scan output and report sections.
- The audit is intentionally lightweight and can be replaced with ecosystem-specific scanners later.
