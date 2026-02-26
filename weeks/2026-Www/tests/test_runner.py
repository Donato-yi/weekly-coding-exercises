from src.eval_runner import evaluate_cases


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


def test_fail_fast_stops_on_failure():
    cases = [
        {"id": "a", "response": "Clear summary with steps. Next, verify."},
        {"id": "b", "response": "No relevant rubric keywords here."},
        {"id": "c", "response": "Concern about risk. Recommend a test."},
    ]
    report = evaluate_cases(cases, min_score=6, fail_fast=True)
    assert len(report["cases"]) == 2
    assert report["failed"] == 1
