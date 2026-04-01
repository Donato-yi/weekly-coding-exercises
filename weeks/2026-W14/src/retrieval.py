from __future__ import annotations

import json
import math
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple
import hashlib


@dataclass
class Snippet:
    source_id: str
    title: str
    url: str
    snippet: str


DEFAULT_KB = [
    Snippet(
        source_id="faq-1",
        title="Account Access Policy",
        url="https://example.com/policy/account-access",
        snippet="We allow access only after verifying the user's identity and 2FA is enabled.",
    ),
    Snippet(
        source_id="faq-2",
        title="Billing Cycles",
        url="https://example.com/billing/cycles",
        snippet="Billing cycles run monthly on the date of signup and invoices are emailed within 24h.",
    ),
    Snippet(
        source_id="faq-3",
        title="Data Retention",
        url="https://example.com/security/retention",
        snippet="We retain logs for 30 days for security monitoring and purge backups after 90 days.",
    ),
]


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "data" / "faq.db"


def _tokenize(text: str) -> List[str]:
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return [t for t in cleaned.split() if len(t) > 2]


def _hash_token(token: str) -> int:
    digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).hexdigest()
    return int(digest, 16)


def embed_text(text: str, dims: int = 64) -> List[float]:
    vector = [0.0] * dims
    tokens = _tokenize(text)
    if not tokens:
        return vector
    for token in tokens:
        bucket = _hash_token(token) % dims
        vector[bucket] += 1.0
    norm = math.sqrt(sum(v * v for v in vector))
    if norm == 0:
        return vector
    return [v / norm for v in vector]


def _cosine(a: Iterable[float], b: Iterable[float]) -> float:
    total = 0.0
    for av, bv in zip(a, b):
        total += av * bv
    return total


def _lexical_overlap(query: str, text: str) -> float:
    q_tokens = set(_tokenize(query))
    if not q_tokens:
        return 0.0
    t_tokens = set(_tokenize(text))
    return len(q_tokens & t_tokens) / max(len(q_tokens), 1)


def init_db(db_path: Path = DEFAULT_DB_PATH) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS snippets (
                source_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                snippet TEXT NOT NULL,
                embedding TEXT NOT NULL
            )
            """
        )
        conn.commit()


def upsert_snippet(snippet: Snippet, db_path: Path = DEFAULT_DB_PATH) -> None:
    init_db(db_path)
    embedding = json.dumps(embed_text(f"{snippet.title} {snippet.snippet}"))
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            INSERT INTO snippets (source_id, title, url, snippet, embedding)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(source_id) DO UPDATE SET
                title=excluded.title,
                url=excluded.url,
                snippet=excluded.snippet,
                embedding=excluded.embedding
            """,
            (snippet.source_id, snippet.title, snippet.url, snippet.snippet, embedding),
        )
        conn.commit()


def _seed_defaults(db_path: Path = DEFAULT_DB_PATH) -> None:
    init_db(db_path)
    with sqlite3.connect(db_path) as conn:
        count = conn.execute("SELECT COUNT(*) FROM snippets").fetchone()[0]
    if count:
        return
    for snippet in DEFAULT_KB:
        upsert_snippet(snippet, db_path=db_path)


def _fetch_all(db_path: Path = DEFAULT_DB_PATH) -> List[Tuple[Snippet, List[float]]]:
    init_db(db_path)
    with sqlite3.connect(db_path) as conn:
        rows = conn.execute(
            "SELECT source_id, title, url, snippet, embedding FROM snippets"
        ).fetchall()
    results = []
    for source_id, title, url, snippet, embedding in rows:
        results.append(
            (
                Snippet(source_id=source_id, title=title, url=url, snippet=snippet),
                json.loads(embedding),
            )
        )
    return results


def retrieve(query: str, k: int = 3, db_path: Optional[Path] = None) -> List[Snippet]:
    db_path = db_path or DEFAULT_DB_PATH
    _seed_defaults(db_path)
    query_embedding = embed_text(query)
    scored: List[Tuple[float, Snippet]] = []
    for snippet, embedding in _fetch_all(db_path):
        cosine_score = _cosine(query_embedding, embedding)
        overlap_score = _lexical_overlap(query, f"{snippet.title} {snippet.snippet}")
        score = 0.75 * cosine_score + 0.25 * overlap_score
        scored.append((score, snippet))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [snippet for score, snippet in scored if score > 0.0][:k]
