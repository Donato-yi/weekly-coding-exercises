from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Iterable, List


TOKEN_RE = re.compile(r"[a-z0-9]+", re.IGNORECASE)


def tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text.lower())


def _stable_hash(token: str) -> int:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return int(digest, 16)


@dataclass
class HashingVectorizer:
    dim: int = 256

    def vectorize(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        for tok in tokenize(text):
            h = _stable_hash(tok)
            idx = h % self.dim
            sign = -1.0 if (h >> 1) & 1 else 1.0
            vec[idx] += sign
        return _normalize(vec)

    def vectorize_many(self, texts: Iterable[str]) -> List[List[float]]:
        return [self.vectorize(t) for t in texts]


def cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _normalize(vec: List[float]) -> List[float]:
    norm = math.sqrt(sum(v * v for v in vec))
    if norm == 0.0:
        return vec
    return [v / norm for v in vec]
