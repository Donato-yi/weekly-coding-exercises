# Static route manifest tutorial

This week’s exercise treats a small JSON manifest as the source of truth for a static site.

## Why this is useful
- Content and frontend teams can review route structure before deploy.
- Internal-link mistakes get caught before a crawler or a user finds them.
- Search-visible pages stay explicit because `public: false` pages are excluded from the sitemap.
- Breadcrumb and section summaries make route reviews easier for both engineers and content owners.

## Basic workflow
1. Update `demos/sample_site.json` or point the CLI at your own manifest.
2. Run the validator and artifact generator.
3. Review `sitemap.xml` and `route-report.md` before shipping.
4. Use the breadcrumb and cross-section link summary to spot awkward IA jumps before deploy.

## Example
```bash
python src/cli.py demos/sample_site.json --base-url https://example.dev --out-dir demos/generated
```

## What to look for in the report
- **Breadcrumbs:** confirm nested pages resolve to sensible parent trails.
- **Section summary:** check page counts and public/private balance by area.
- **Cross-section links:** surface surprising jumps, like marketing pages funneling into docs or hidden content.
- **Hub pages:** identify the routes carrying the most internal navigation weight.

## Extension ideas
- Add last-modified dates for sitemap freshness.
- Emit JSON output for CI checks.
- Add configurable breadcrumb labels when manifest titles differ from nav labels.
