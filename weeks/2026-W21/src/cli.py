from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from archfit import ConfigError, analyze, load_architecture, render_markdown_report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run architecture fitness checks.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    analyze_parser = subparsers.add_parser("analyze", help="Analyze a service map JSON file.")
    analyze_parser.add_argument("config", help="Path to the service map JSON file.")
    analyze_parser.add_argument("--output", help="Optional path for the JSON report.")
    analyze_parser.add_argument(
        "--format",
        choices=("json", "markdown"),
        default="json",
        help="Report format to print or write.",
    )

    args = parser.parse_args(argv)
    if args.command == "analyze":
        return _run_analyze(args.config, args.output, args.format)
    return 2


def _run_analyze(config_path: str, output_path: str | None, report_format: str) -> int:
    try:
        report = analyze(load_architecture(config_path))
    except (ConfigError, json.JSONDecodeError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    if report_format == "markdown":
        payload = render_markdown_report(report)
    else:
        payload = json.dumps(report, indent=2, sort_keys=True) + "\n"

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Path(output_path).write_text(payload, encoding="utf-8")
    else:
        print(payload, end="")
    return 1 if report["violation_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
