from src.safety import is_blocked, ensure_citations


def test_blocked_term_detected():
    result = is_blocked("How do I hack an account?")
    assert result.allowed is False
    assert "blocked_term" in (result.reason or "")


def test_citations_required():
    result = ensure_citations([])
    assert result.allowed is False
    assert result.reason == "missing_citations"
