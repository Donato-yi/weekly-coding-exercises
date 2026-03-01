from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

from rubrics import build_default_rubric
from snapshots import check_snapshot


@dataclass
class CaseResult:
    case_id: str
    score: int
    passed: bool
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


def evaluate_cases(
    cases: List[Dict[str, str]],
    min_score: int = 0,
    fail_fast: bool = False,
) -> Dict[str, object]:
    rubric = build_default_rubric()
    results: List[CaseResult] = []
    total_score = 0
    failed = 0
    criteria_hits = {criterion.name: 0 for criterion in rubric.criteria}

    for case in cases:
        response = case.get("response", "")
        score_data = rubric.score(response)
        score = score_data["total"]
        passed = score >= min_score
        for name in score_data["hits"].keys():
            criteria_hits[name] += 1
        if not passed:
            failed += 1
        results.append(
            CaseResult(
                case_id=case.get("id", "unknown"),
                score=score,
                passed=passed,
                hits=score_data["hits"],
            )
        )
        total_score += score

        if fail_fast and not passed:
            break

    average = round(total_score / max(len(results), 1), 2)
    return {
        "rubric": rubric.name,
        "max_score": rubric.max_score,
        "min_score": min_score,
        "total_score": total_score,
        "average_score": average,
        "passed": len(results) - failed,
        "failed": failed,
        "cases": results,
        "criteria_hits": criteria_hits,
    }


def to_markdown(report: Dict[str, object]) -> str:
    lines = [
        f"# Eval Report — {report['rubric']}",
        f"Average score: {report['average_score']} / {report['max_score']}",
        f"Min score threshold: {report['min_score']}",
        f"Cases: {len(report['cases'])} | Passed: {report['passed']} | Failed: {report['failed']}",
        "",
        "## Criteria Coverage",
    ]
    case_count = max(len(report["cases"]), 1)
    for name, count in report["criteria_hits"].items():
        lines.append(f"- {name}: {count} / {case_count} cases")
    lines.extend([
        "",
        "## Case Results",
    ])
    for case in report["cases"]:
        status = "pass" if case.passed else "fail"
        hits = ", ".join(f"{name}({weight})" for name, weight in case.hits.items()) or "none"
        lines.append(f"- {case.case_id}: {case.score} [{status}] | hits: {hits}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a simple rubric-based evaluation.")
    parser.add_argument("path", type=Path, help="Path to JSONL cases")
    parser.add_argument("--out", type=Path, default=None, help="Optional output markdown path")
    parser.add_argument("--min-score", type=int, default=0, help="Minimum score to pass")
    parser.add_argument("--fail-fast", action="store_true", help="Stop at first failing case")
    parser.add_argument("--snapshot", type=Path, default=None, help="Path to regression snapshot")
    parser.add_argument(
        "--update-snapshot",
        action="store_true",
        help="Overwrite snapshot with current output",
    )
    args = parser.parse_args()

    cases = read_jsonl(args.path)
    report = evaluate_cases(cases, min_score=args.min_score, fail_fast=args.fail_fast)
    markdown = to_markdown(report)

    if args.snapshot:
        ok, message = check_snapshot(markdown, args.snapshot, update=args.update_snapshot)
        if not ok:
            print(f"Snapshot mismatch: {args.snapshot}")
            raise SystemExit(1)
        print(f"Snapshot: {message}")

    if args.out:
        args.out.write_text(markdown, encoding="utf-8")
    else:
        print(markdown)


if __name__ == "__main__":
    main()
