from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from .embedder import HashingVectorizer, cosine


@dataclass
class DocumentIndex:
    vectorizer: HashingVectorizer = field(default_factory=HashingVectorizer)
    _vectors: Dict[str, List[float]] = field(default_factory=dict)
    _docs: Dict[str, str] = field(default_factory=dict)

    def add(self, doc_id: str, text: str) -> None:
        self._docs[doc_id] = text
        self._vectors[doc_id] = self.vectorizer.vectorize(text)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[str, float]]:
        if not query.strip():
            return []
        qvec = self.vectorizer.vectorize(query)
        scored = []
        for doc_id, dvec in self._vectors.items():
            scored.append((doc_id, cosine(qvec, dvec)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def get(self, doc_id: str) -> str | None:
        return self._docs.get(doc_id)
