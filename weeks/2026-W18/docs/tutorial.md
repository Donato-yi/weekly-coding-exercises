# Static route manifest tutorial

This week’s exercise treats a small JSON manifest as the source of truth for a static site.

## Why this is useful
- Content and frontend teams can review route structure before deploy.
- Internal-link mistakes get caught before a crawler or a user finds them.
- Search-visible pages stay explicit because `public: false` pages are excluded from the sitemap.

## Basic workflow
1. Update `demos/sample_site.json` or point the CLI at your own manifest.
2. Run the validator and artifact generator.
3. Review `sitemap.xml` and `route-report.md` before shipping.

## Example
```bash
python src/cli.py demos/sample_site.json --base-url https://example.dev --out-dir demos/generated
```

## Extension ideas
- Add last-modified dates for sitemap freshness.
- Add breadcrumb generation from section metadata.
- Emit JSON output for CI checks.
