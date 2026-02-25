from src.rubrics import build_default_rubric


def test_rubric_scoring_keywords():
    rubric = build_default_rubric()
    text = "Clear summary with steps. Next, verify results."
    scored = rubric.score(text)
    assert scored["total"] == 8
    assert set(scored["hits"].keys()) == {"clarity", "structure", "verification", "actionable"}
