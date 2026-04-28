# Weekly Focus — 2026-W18

## Theme
- Static-site route manifest and sitemap toolkit for small web projects

## Focus Area
- web

## Primary Language / Stack
- Python 3.13 + static site manifests + XML sitemap generation

## Weekly Goal
- Build a lightweight toolkit that validates page metadata, checks internal navigation links, and generates a clean sitemap plus markdown route report for static websites.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Build manifest parser, link validation, sitemap generation, CLI, and starter tests
- Wed: Add canonical URL checks and duplicate-slug warnings
- Thu: Add breadcrumb and navigation summaries
- Fri: Add richer reporting output and docs polish
- Sat: Add more demo site scenarios and edge-case validation
- Sun: Refactor, summarize tradeoffs, and capture follow-up ideas

## Exercises (What to Build)
- JSON-driven page manifest parser
- Route validator for duplicate paths and broken internal links
- XML sitemap generator for public pages
- Markdown report generator for quick content review
- CLI for validation and artifact generation

## Tests (What to Validate)
- Routes normalize correctly for root and nested paths
- Broken links are reported with source-page context
- Hidden pages are excluded from the sitemap
- Duplicate paths and duplicate canonical URLs emit warnings
- CLI-generated reports remain deterministic for the sample manifest

## UI Demos (What to Showcase)
- Sample page manifest for a small docs/product site
- Generated sitemap.xml output
- Markdown route summary for content review
- Notes on how a frontend engineer or content designer could use the tool before deploy

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Treat the page manifest like a lightweight contract between content and engineering.
- Broken internal links are easiest to fix when the report points back to the page that introduced them.
- Sitemap generation should stay boring and deterministic because search tooling depends on stable output.
- Public/private page flags matter because not every route belongs in a search index.

## Getting Started
```bash
python -m unittest discover -s tests -v
python src/cli.py demos/sample_site.json --base-url https://example.dev --out-dir demos/generated
```

## Daily Log
- **Daily Entry — 2026-04-28**
  - **Progress:** Implemented the initial web toolkit, including manifest parsing, route normalization, internal-link checks, sitemap generation, markdown reporting, a CLI, docs, and demo output.
  - **Exercises Completed:** Core page validator, sitemap builder, route report generation, sample site manifest, and unittest coverage.
  - **Tests Run:** `python -m unittest discover -s tests -v`
  - **UI Demo Notes:** Added a generated sitemap and route summary under `/demos/generated` to mimic a pre-deploy content review pass.
  - **Tried / Solved / Learned:** Even small static sites benefit from a repeatable route audit because broken links and indexing mistakes slip in faster than expected.

## Tried / Solved / Learned
- A tiny manifest format can cover a surprising amount of practical web QA.
- Deterministic route reports make content reviews much easier to diff in Git.
- Sitemap generation becomes safer when hidden pages are explicitly modeled instead of filtered ad hoc.
- Link validation is more actionable when failures include both the missing target and the page that referenced it.
