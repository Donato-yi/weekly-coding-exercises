from __future__ import annotations

from pathlib import Path

from src.retrieval import Snippet, retrieve, upsert_snippet


def test_retrieve_returns_relevant_snippet(tmp_path: Path) -> None:
    db_path = tmp_path / "faq.db"
    upsert_snippet(
        Snippet(
            source_id="test-1",
            title="Password Reset",
            url="https://example.com/help/reset",
            snippet="Users can reset passwords from the account settings page.",
        ),
        db_path=db_path,
    )

    results = retrieve("How do I reset my password?", db_path=db_path)
    assert results
    assert results[0].source_id == "test-1"
