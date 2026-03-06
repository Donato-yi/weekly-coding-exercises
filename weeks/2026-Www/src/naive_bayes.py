"""Minimal Naive Bayes text classifier (multinomial) with Laplace smoothing."""
from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from typing import Dict, Iterable, List, Tuple

TOKEN_RE = re.compile(r"[^a-zA-Z0-9\s]")


def tokenize(text: str) -> List[str]:
    cleaned = TOKEN_RE.sub(" ", text.lower())
    return [t for t in cleaned.split() if t]


class NaiveBayesClassifier:
    def __init__(self, alpha: float = 1.0) -> None:
        self.alpha = alpha
        self.class_counts: Counter[str] = Counter()
        self.token_counts: Dict[str, Counter[str]] = defaultdict(Counter)
        self.total_tokens: Counter[str] = Counter()
        self.vocab: set[str] = set()
        self.fitted = False

    def fit(self, texts: Iterable[str], labels: Iterable[str]) -> None:
        for text, label in zip(texts, labels):
            self.class_counts[label] += 1
            tokens = tokenize(text)
            self.token_counts[label].update(tokens)
            self.total_tokens[label] += len(tokens)
            self.vocab.update(tokens)
        self.fitted = True

    def _class_log_prior(self, label: str) -> float:
        total = sum(self.class_counts.values())
        return math.log(self.class_counts[label] / total)

    def _token_log_prob(self, token: str, label: str) -> float:
        vocab_size = max(len(self.vocab), 1)
        count = self.token_counts[label][token]
        return math.log((count + self.alpha) / (self.total_tokens[label] + self.alpha * vocab_size))

    def predict_proba(self, text: str) -> Dict[str, float]:
        if not self.fitted:
            raise ValueError("Model is not fitted")
        tokens = tokenize(text)
        log_probs: Dict[str, float] = {}
        for label in self.class_counts:
            log_prob = self._class_log_prior(label)
            for token in tokens:
                log_prob += self._token_log_prob(token, label)
            log_probs[label] = log_prob
        # normalize
        max_log = max(log_probs.values())
        exp_sum = sum(math.exp(lp - max_log) for lp in log_probs.values())
        probs = {label: math.exp(lp - max_log) / exp_sum for label, lp in log_probs.items()}
        return probs

    def predict(self, text: str) -> str:
        probs = self.predict_proba(text)
        return max(probs.items(), key=lambda kv: kv[1])[0]

    def evaluate(self, texts: Iterable[str], labels: Iterable[str]) -> Tuple[float, Dict[str, Dict[str, int]]]:
        if not self.fitted:
            raise ValueError("Model is not fitted")
        confusion: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        correct = 0
        total = 0
        for text, actual in zip(texts, labels):
            pred = self.predict(text)
            confusion[actual][pred] += 1
            correct += 1 if pred == actual else 0
            total += 1
        accuracy = correct / total if total else 0.0
        return accuracy, confusion

    def top_tokens(self, label: str, k: int = 5) -> List[Tuple[str, float]]:
        """Return the top-k tokens by probability for a given class."""
        tokens = list(self.vocab)
        scored = [(token, math.exp(self._token_log_prob(token, label))) for token in tokens]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:k]
