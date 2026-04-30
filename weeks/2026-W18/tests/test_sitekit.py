import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from sitekit import build_breadcrumbs, build_markdown_report, build_sitemap, normalize_path, parse_manifest, validate_pages


class SiteKitTests(unittest.TestCase):
    def sample_pages(self):
        payload = {
            "pages": [
                {"title": "Home", "path": "/", "links": ["/docs", "/pricing"], "section": "marketing"},
                {"title": "Docs", "path": "/docs/", "links": ["/", "/docs/getting-started", "/pricing", "/missing"], "section": "docs"},
                {"title": "Getting Started", "path": "/docs/getting-started", "links": ["/docs", "/pricing"], "section": "docs"},
                {"title": "Pricing", "path": "pricing", "links": ["/"], "section": "marketing"},
                {"title": "Draft", "path": "/draft", "public": False, "links": ["/"], "section": "internal"},
            ]
        }
        return parse_manifest(payload)

    def test_normalize_path(self):
        self.assertEqual(normalize_path("pricing"), "/pricing")
        self.assertEqual(normalize_path("/docs/"), "/docs")
        self.assertEqual(normalize_path("/"), "/")

    def test_broken_links_are_reported(self):
        validation = validate_pages(self.sample_pages(), "https://example.dev")
        self.assertIn("Broken internal link: /docs -> /missing", validation["errors"])

    def test_hidden_pages_are_excluded_from_sitemap(self):
        sitemap = build_sitemap(self.sample_pages(), "https://example.dev")
        self.assertIn("https://example.dev/docs", sitemap)
        self.assertNotIn("https://example.dev/draft", sitemap)

    def test_duplicate_canonical_urls_warn(self):
        payload = {
            "pages": [
                {"title": "One", "path": "/one", "canonical": "https://example.dev/shared"},
                {"title": "Two", "path": "/two", "canonical": "https://example.dev/shared"},
            ]
        }
        pages = parse_manifest(payload)
        validation = validate_pages(pages, "https://example.dev")
        self.assertTrue(any("Duplicate canonical URL" in warning for warning in validation["warnings"]))

    def test_breadcrumbs_include_parent_pages(self):
        pages = self.sample_pages()
        getting_started = next(page for page in pages if page.path == "/docs/getting-started")
        self.assertEqual(build_breadcrumbs(getting_started, pages), ["Home", "Docs", "Getting Started"])

    def test_report_includes_navigation_summary(self):
        pages = self.sample_pages()
        validation = validate_pages(pages, "https://example.dev")
        report = build_markdown_report(pages, validation, "https://example.dev")
        self.assertIn("## Navigation Summary", report)
        self.assertIn("marketing -> docs", report)
        self.assertIn("Breadcrumbs: Home > Docs > Getting Started", report)

    def test_cli_generates_artifacts(self):
        manifest = ROOT / "demos" / "sample_site.json"
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run(
                [sys.executable, str(SRC / "cli.py"), str(manifest), "--base-url", "https://example.dev", "--out-dir", tmp],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            output = json.loads(result.stdout)
            self.assertEqual(output["pages"], 6)
            self.assertTrue((Path(tmp) / "sitemap.xml").exists())
            self.assertTrue((Path(tmp) / "route-report.md").exists())


if __name__ == "__main__":
    unittest.main()
