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
- Breadcrumbs resolve parent pages for nested routes
- CLI-generated reports remain deterministic for the sample manifest

## UI Demos (What to Showcase)
- Sample page manifest for a small docs/product site
- Generated sitemap.xml output
- Markdown route summary for content review
- Breadcrumb trails for nested docs pages
- Section and hub-page summaries that show how navigation flows across the site
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
- Breadcrumb and section summaries turn route validation into a lightweight information-architecture review.

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
- **Daily Entry — 2026-04-30**
  - **Progress:** Added breadcrumb generation for nested routes plus section, cross-section, and hub-page navigation summaries in the markdown report.
  - **Exercises Completed:** Breadcrumb helper, navigation summarizer, nested docs demo route, expanded unittest coverage, and tutorial updates for report review.
  - **Tests Run:** `python -m unittest discover -s tests -v`
  - **UI Demo Notes:** The generated report now shows `Home > Docs > Getting Started` breadcrumbs and a quick view of which sections link most heavily into each other.
  - **Tried / Solved / Learned:** Route QA becomes much more useful when it also explains site structure, not just breakage.

## Tried / Solved / Learned
- A tiny manifest format can cover a surprising amount of practical web QA.
- Deterministic route reports make content reviews much easier to diff in Git.
- Sitemap generation becomes safer when hidden pages are explicitly modeled instead of filtered ad hoc.
- Link validation is more actionable when failures include both the missing target and the page that referenced it.
- Breadcrumbs and section-level summaries help the same tool support both debugging and information-architecture review.
