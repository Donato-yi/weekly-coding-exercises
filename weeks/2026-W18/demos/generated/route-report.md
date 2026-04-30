# Route Review Report

- Base URL: `https://example.dev`
- Total pages: 6
- Public pages: 5
- Errors: 0
- Warnings: 0

## Pages
- `/` (public) — Home
  - Breadcrumbs: Home
  - Section: marketing
  - Links: /docs, /pricing, /blog
- `/blog` (public) — Blog
  - Breadcrumbs: Home > Blog
  - Section: content
  - Links: /, /docs, /changelog
- `/changelog` (hidden) — Changelog
  - Breadcrumbs: Home > Changelog
  - Section: content
  - Links: /blog
- `/docs` (public) — Docs
  - Breadcrumbs: Home > Docs
  - Section: docs
  - Links: /, /docs/getting-started, /pricing
- `/docs/getting-started` (public) — Getting Started
  - Breadcrumbs: Home > Docs > Getting Started
  - Section: docs
  - Links: /docs, /pricing, /blog
- `/pricing` (public) — Pricing
  - Breadcrumbs: Home > Pricing
  - Section: marketing
  - Links: /, /docs

## Navigation Summary
### Sections
- content: 2 pages, 1 public
  - Paths: /blog, /changelog
- docs: 2 pages, 2 public
  - Paths: /docs, /docs/getting-started
- marketing: 2 pages, 2 public
  - Paths: /, /pricing

### Cross-section links
- content -> content: 2
- content -> docs: 1
- content -> marketing: 1
- docs -> content: 1
- docs -> docs: 2
- docs -> marketing: 3
- marketing -> content: 1
- marketing -> docs: 2
- marketing -> marketing: 2

### Hub pages
- `/`: 3 internal links (3 unique)
- `/blog`: 3 internal links (3 unique)
- `/docs`: 3 internal links (3 unique)
- `/docs/getting-started`: 3 internal links (3 unique)
- `/pricing`: 2 internal links (2 unique)

## Errors
- None

## Warnings
- None
