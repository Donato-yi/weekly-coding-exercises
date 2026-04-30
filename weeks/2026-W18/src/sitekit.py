from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Iterable


@dataclass(slots=True)
class Page:
    title: str
    path: str
    links: list[str] = field(default_factory=list)
    public: bool = True
    canonical: str | None = None
    section: str | None = None


def normalize_path(path: str) -> str:
    cleaned = (path or "/").strip()
    if not cleaned:
        return "/"
    if not cleaned.startswith("/"):
        cleaned = "/" + cleaned
    if cleaned != "/" and cleaned.endswith("/"):
        cleaned = cleaned[:-1]
    return cleaned


def parse_manifest(payload: dict) -> list[Page]:
    return [
        Page(
            title=item["title"],
            path=normalize_path(item["path"]),
            links=[normalize_path(link) for link in item.get("links", [])],
            public=item.get("public", True),
            canonical=item.get("canonical"),
            section=item.get("section"),
        )
        for item in payload.get("pages", [])
    ]


def build_breadcrumbs(page: Page, pages: Iterable[Page]) -> list[str]:
    page_map = {candidate.path: candidate for candidate in pages}
    if page.path == "/":
        return [page.title]

    crumbs: list[str] = []
    current = ""
    for segment in page.path.strip("/").split("/"):
        current = f"{current}/{segment}"
        match = page_map.get(current)
        crumbs.append(match.title if match else segment.replace("-", " ").title())
    if "/" in page_map:
        return [page_map["/"].title, *crumbs]
    return crumbs


def summarize_navigation(pages: Iterable[Page]) -> dict:
    page_list = list(pages)
    page_map = {page.path: page for page in page_list}
    section_pages: dict[str, list[Page]] = defaultdict(list)
    section_links: Counter[tuple[str, str]] = Counter()
    hub_rows: list[tuple[str, int, int]] = []

    for page in page_list:
        section = page.section or "unassigned"
        section_pages[section].append(page)
        internal_links = [link for link in page.links if link in page_map]
        hub_rows.append((page.path, len(internal_links), len(set(internal_links))))
        for link in internal_links:
            target_section = page_map[link].section or "unassigned"
            section_links[(section, target_section)] += 1

    return {
        "sections": [
            {
                "section": section,
                "page_count": len(sorted_pages),
                "public_pages": sum(1 for page in sorted_pages if page.public),
                "paths": [page.path for page in sorted(sorted_pages, key=lambda item: item.path)],
            }
            for section, sorted_pages in sorted(section_pages.items())
        ],
        "cross_section_links": [
            {"from": source, "to": target, "count": count}
            for (source, target), count in sorted(section_links.items())
        ],
        "hub_pages": [
            {"path": path, "internal_links": internal_count, "unique_internal_links": unique_count}
            for path, internal_count, unique_count in sorted(
                hub_rows,
                key=lambda row: (-row[1], row[0]),
            )
        ],
    }


def validate_pages(pages: Iterable[Page], base_url: str) -> dict:
    pages = list(pages)
    path_map: dict[str, Page] = {}
    errors: list[str] = []
    warnings: list[str] = []
    duplicate_paths: set[str] = set()
    canonical_seen: dict[str, str] = {}

    for page in pages:
        if page.path in path_map:
            duplicate_paths.add(page.path)
        path_map[page.path] = page

    for duplicate in sorted(duplicate_paths):
        warnings.append(f"Duplicate path detected: {duplicate}")

    for page in pages:
        canonical_url = page.canonical or (base_url.rstrip("/") + page.path)
        if canonical_url in canonical_seen:
            warnings.append(
                f"Duplicate canonical URL: {canonical_url} used by {canonical_seen[canonical_url]} and {page.path}"
            )
        else:
            canonical_seen[canonical_url] = page.path

        for link in page.links:
            if link not in path_map:
                errors.append(f"Broken internal link: {page.path} -> {link}")

    return {
        "errors": errors,
        "warnings": warnings,
        "paths": sorted(path_map),
        "public_paths": [page.path for page in pages if page.public],
        "navigation": summarize_navigation(pages),
    }


def build_sitemap(pages: Iterable[Page], base_url: str) -> str:
    public_pages = sorted((page for page in pages if page.public), key=lambda p: p.path)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for page in public_pages:
        loc = page.canonical or (base_url.rstrip("/") + page.path)
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_markdown_report(pages: Iterable[Page], validation: dict, base_url: str) -> str:
    pages = sorted(list(pages), key=lambda p: p.path)
    navigation = validation["navigation"]
    lines = [
        "# Route Review Report",
        "",
        f"- Base URL: `{base_url}`",
        f"- Total pages: {len(pages)}",
        f"- Public pages: {sum(1 for page in pages if page.public)}",
        f"- Errors: {len(validation['errors'])}",
        f"- Warnings: {len(validation['warnings'])}",
        "",
        "## Pages",
    ]
    for page in pages:
        visibility = "public" if page.public else "hidden"
        lines.append(f"- `{page.path}` ({visibility}) — {page.title}")
        lines.append(f"  - Breadcrumbs: {' > '.join(build_breadcrumbs(page, pages))}")
        if page.section:
            lines.append(f"  - Section: {page.section}")
        if page.links:
            lines.append(f"  - Links: {', '.join(page.links)}")
    lines.extend([
        "",
        "## Navigation Summary",
        "### Sections",
    ])
    for section in navigation["sections"]:
        lines.append(
            f"- {section['section']}: {section['page_count']} pages, {section['public_pages']} public"
        )
        lines.append(f"  - Paths: {', '.join(section['paths'])}")
    lines.append("")
    lines.append("### Cross-section links")
    if navigation["cross_section_links"]:
        for item in navigation["cross_section_links"]:
            lines.append(f"- {item['from']} -> {item['to']}: {item['count']}")
    else:
        lines.append("- None")
    lines.append("")
    lines.append("### Hub pages")
    for hub in navigation["hub_pages"][:5]:
        lines.append(
            f"- `{hub['path']}`: {hub['internal_links']} internal links ({hub['unique_internal_links']} unique)"
        )
    lines.append("")
    lines.append("## Errors")
    if validation["errors"]:
        for error in validation["errors"]:
            lines.append(f"- {error}")
    else:
        lines.append("- None")
    lines.append("")
    lines.append("## Warnings")
    if validation["warnings"]:
        for warning in validation["warnings"]:
            lines.append(f"- {warning}")
    else:
        lines.append("- None")
    return "\n".join(lines) + "\n"
