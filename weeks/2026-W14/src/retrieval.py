from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class Snippet:
    source_id: str
    title: str
    url: str
    snippet: str


KB = [
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


def retrieve(query: str, k: int = 3) -> List[Snippet]:
    terms = {t.lower() for t in query.split() if len(t) > 2}
    scored = []
    for snippet in KB:
        score = sum(1 for t in terms if t in snippet.snippet.lower() or t in snippet.title.lower())
        scored.append((score, snippet))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for score, s in scored if score > 0][:k]
