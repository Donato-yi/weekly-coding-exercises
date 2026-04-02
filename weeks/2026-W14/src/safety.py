from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional


DEFAULT_BLOCKLIST = [
    "password",
    "credit card",
    "ssn",
    "social security",
    "exploit",
    "malware",
    "phishing",
    "bypass",
    "hack",
]


@dataclass
class SafetyResult:
    allowed: bool
    reason: Optional[str] = None


def _normalize(text: str) -> str:
    return text.lower().strip()


def is_blocked(question: str, blocklist: Iterable[str] = DEFAULT_BLOCKLIST) -> SafetyResult:
    lowered = _normalize(question)
    for term in blocklist:
        if term in lowered:
            return SafetyResult(allowed=False, reason=f"blocked_term:{term}")
    return SafetyResult(allowed=True, reason=None)


def ensure_citations(citations: List[object]) -> SafetyResult:
    if not citations:
        return SafetyResult(allowed=False, reason="missing_citations")
    return SafetyResult(allowed=True, reason=None)
