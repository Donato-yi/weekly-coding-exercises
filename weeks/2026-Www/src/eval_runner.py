from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

from rubrics import build_default_rubric


@dataclass
class CaseResult:
    case_id: str
    score: int
    hits: Dict[str, int]


def read_jsonl(path: Path) -> List[Dict[str, str]]:
    cases = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            cases.append(json.loads(line))
    return cases


def evaluate_cases(cases: List[Dict[str, str]]) -> Dict[str, object]:
    rubric = build_default_rubric()
    results: List[CaseResult] = []
    total_score = 0
    for case in cases:
        response = case.get("response", "")
        score_data = rubric.score(response)
        score = score_data["total"]
        results.append(CaseResult(case_id=case.get("id", "unknown"), score=score, hits=score_data["hits"]))
        total_score += score

    average = round(total_score / max(len(results), 1), 2)
    return {
        "rubric": rubric.name,
        "max_score": rubric.max_score,
        "average_score": average,
        "cases": results,
    }


def to_markdown(report: Dict[str, object]) -> str:
    lines = [
        f"# Eval Report — {report['rubric']}",
        f"Average score: {report['average_score']} / {report['max_score']}",
        "",
        "## Case Results",
    ]
    for case in report["cases"]:
        lines.append(f"- {case.case_id}: {case.score} | hits: {', '.join(case.hits.keys()) or 'none'}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a simple rubric-based evaluation.")
    parser.add_argument("path", type=Path, help="Path to JSONL cases")
    parser.add_argument("--out", type=Path, default=None, help="Optional output markdown path")
    args = parser.parse_args()

    cases = read_jsonl(args.path)
    report = evaluate_cases(cases)
    markdown = to_markdown(report)

    if args.out:
        args.out.write_text(markdown, encoding="utf-8")
    else:
        print(markdown)


if __name__ == "__main__":
    main()
