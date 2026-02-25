from src.eval_runner import evaluate_cases


def test_evaluate_cases_summary():
    cases = [
        {"id": "a", "response": "Clear summary with steps. Next, verify."},
        {"id": "b", "response": "Concern about risk. Recommend a test."},
    ]
    report = evaluate_cases(cases)
    assert report["rubric"] == "default"
    assert report["max_score"] == 10
    assert len(report["cases"]) == 2
    assert report["average_score"] > 0
