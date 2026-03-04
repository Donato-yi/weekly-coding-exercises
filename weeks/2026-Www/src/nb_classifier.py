from __future__ import annotations

from collections import Counter, defaultdict
from typing import Dict, Iterable, List, Tuple
import math

from .tokenize import tokenize


class NaiveBayesClassifier:
    def __init__(self, alpha: float = 1.0) -> None:
        self.alpha = alpha
        self.class_counts: Counter[str] = Counter()
        self.token_counts: Dict[str, Counter[str]] = defaultdict(Counter)
        self.vocab: Counter[str] = Counter()
        self.total_docs = 0

    def fit(self, samples: Iterable[Tuple[str, str]]) -> None:
        for label, text in samples:
            self.class_counts[label] += 1
            self.total_docs += 1
            for token in tokenize(text):
                self.token_counts[label][token] += 1
                self.vocab[token] += 1

    def _log_prior(self, label: str) -> float:
        return math.log(self.class_counts[label] / self.total_docs)

    def _log_likelihood(self, label: str, tokens: List[str]) -> float:
        token_total = sum(self.token_counts[label].values())
        vocab_size = len(self.vocab) or 1
        log_prob = 0.0
        for token in tokens:
            count = self.token_counts[label][token]
            prob = (count + self.alpha) / (token_total + self.alpha * vocab_size)
            log_prob += math.log(prob)
        return log_prob

    def predict_proba(self, text: str) -> Dict[str, float]:
        tokens = tokenize(text)
        scores = {}
        for label in self.class_counts:
            scores[label] = self._log_prior(label) + self._log_likelihood(label, tokens)

        # Normalize log-scores to probabilities
        max_log = max(scores.values())
        exp_scores = {label: math.exp(val - max_log) for label, val in scores.items()}
        total = sum(exp_scores.values()) or 1.0
        return {label: val / total for label, val in exp_scores.items()}

    def predict(self, text: str) -> str:
        probs = self.predict_proba(text)
        return max(probs.items(), key=lambda item: item[1])[0]
