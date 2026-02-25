from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Dict


@dataclass(frozen=True)
class Criterion:
    name: str
    weight: int
    keywords: List[str]


@dataclass(frozen=True)
class Rubric:
    name: str
    max_score: int
    criteria: List[Criterion]

    def score(self, text: str) -> Dict[str, int]:
        normalized = text.lower()
        total = 0
        hits: Dict[str, int] = {}
        for criterion in self.criteria:
            if any(keyword in normalized for keyword in criterion.keywords):
                total += criterion.weight
                hits[criterion.name] = criterion.weight
        total = min(total, self.max_score)
        return {"total": total, "hits": hits}


def build_default_rubric() -> Rubric:
    criteria = [
        Criterion("clarity", 2, ["clear", "concise", "summary"]),
        Criterion("structure", 2, ["steps", "bullet", "outline"]),
        Criterion("risk", 2, ["risk", "caution", "concern"]),
        Criterion("verification", 2, ["verify", "validate", "test"]),
        Criterion("actionable", 2, ["do this", "next", "recommend"]),
    ]
    return Rubric(name="default", max_score=10, criteria=criteria)
