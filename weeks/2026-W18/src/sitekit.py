from __future__ import annotations

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
    pages = []
    for item in payload.get("pages", []):
        pages.append(
            Page(
                title=item["title"],
                path=normalize_path(item["path"]),
                links=[normalize_path(link) for link in item.get("links", [])],
                public=item.get("public", True),
                canonical=item.get("canonical"),
                section=item.get("section"),
            )
        )
    return pages


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
    }


def build_sitemap(pages: Iterable[Page], base_url: str) -> str:
    public_pages = sorted((page for page in pages if page.public), key=lambda p: p.path)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for page in public_pages:
        loc = (page.canonical or (base_url.rstrip("/") + page.path))
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_markdown_report(pages: Iterable[Page], validation: dict, base_url: str) -> str:
    pages = sorted(list(pages), key=lambda p: p.path)
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
        if page.links:
            lines.append(f"  - Links: {', '.join(page.links)}")
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
