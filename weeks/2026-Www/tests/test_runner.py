from src.eval_runner import evaluate_cases, _format_hits, _sorted_criteria_coverage


def test_evaluate_cases_summary():
    cases = [
        {"id": "a", "response": "Clear summary with steps. Next, verify."},
        {"id": "b", "response": "Concern about risk. Recommend a test."},
    ]
    report = evaluate_cases(cases, min_score=6)
    assert report["rubric"] == "default"
    assert report["max_score"] == 10
    assert report["min_score"] == 6
    assert len(report["cases"]) == 2
    assert report["average_score"] > 0
    assert report["passed"] + report["failed"] == 2
    assert report["criteria_hits"]["clarity"] == 1
    assert report["criteria_hits"]["structure"] == 1
    assert report["criteria_hits"]["verification"] == 2
    assert report["criteria_hits"]["actionable"] == 2
    assert report["criteria_hits"]["risk"] == 1
    assert report["criteria_coverage"]["clarity"]["percent"] == 50.0
    assert report["criteria_coverage"]["verification"]["percent"] == 100.0


def test_fail_fast_stops_on_failure():
    cases = [
        {"id": "a", "response": "Clear summary with steps. Next, verify."},
        {"id": "b", "response": "No relevant rubric keywords here."},
        {"id": "c", "response": "Concern about risk. Recommend a test."},
    ]
    report = evaluate_cases(cases, min_score=6, fail_fast=True)
    assert len(report["cases"]) == 2
    assert report["failed"] == 1


def test_markdown_helpers_sort_consistently():
    hits = {"risk": 2, "clarity": 2, "structure": 1}
    assert _format_hits(hits) == "clarity(2), risk(2), structure(1)"

    coverage = {
        "risk": {"count": 1, "percent": 50.0},
        "clarity": {"count": 2, "percent": 100.0},
        "actionable": {"count": 2, "percent": 100.0},
    }
    ordered = _sorted_criteria_coverage(coverage)
    assert [name for name, _ in ordered] == ["actionable", "clarity", "risk"]
