from __future__ import annotations

import argparse
import json
from pathlib import Path

from sitekit import build_markdown_report, build_sitemap, parse_manifest, validate_pages


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a static-site manifest and generate artifacts.")
    parser.add_argument("manifest", help="Path to a JSON manifest with a pages array")
    parser.add_argument("--base-url", default="https://example.dev", help="Base URL for sitemap/canonical generation")
    parser.add_argument("--out-dir", default="generated", help="Directory for sitemap.xml and route-report.md")
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    pages = parse_manifest(payload)
    validation = validate_pages(pages, args.base_url)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "sitemap.xml").write_text(build_sitemap(pages, args.base_url), encoding="utf-8")
    (out_dir / "route-report.md").write_text(
        build_markdown_report(pages, validation, args.base_url), encoding="utf-8"
    )

    print(json.dumps({
        "pages": len(pages),
        "public_pages": len(validation["public_paths"]),
        "errors": len(validation["errors"]),
        "warnings": len(validation["warnings"]),
        "out_dir": str(out_dir),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
