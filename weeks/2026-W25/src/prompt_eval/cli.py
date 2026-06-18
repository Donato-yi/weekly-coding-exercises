from __future__ import annotations

import argparse
import json
from pathlib import Path

from .metrics import analyze_records, load_jsonl, render_markdown


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Evaluate local AI workflow traces.")
    parser.add_argument("trace_file", help="Path to a JSONL trace file.")
    parser.add_argument("--out-dir", default="demos/out", help="Directory for report artifacts.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    records = load_jsonl(args.trace_file)
    report = analyze_records(records)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (out_dir / "report.md").write_text(render_markdown(report), encoding="utf-8")

    print(f"Wrote {out_dir / 'report.json'}")
    print(f"Wrote {out_dir / 'report.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
