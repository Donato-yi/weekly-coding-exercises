from __future__ import annotations

from typing import Dict, Iterable, List, Tuple


def accuracy(y_true: Iterable[str], y_pred: Iterable[str]) -> float:
    true_list = list(y_true)
    pred_list = list(y_pred)
    if not true_list:
        return 0.0
    correct = sum(1 for t, p in zip(true_list, pred_list) if t == p)
    return correct / len(true_list)


def confusion_matrix(labels: List[str], y_true: List[str], y_pred: List[str]) -> Dict[str, Dict[str, int]]:
    matrix = {label: {col: 0 for col in labels} for label in labels}
    for t, p in zip(y_true, y_pred):
        matrix[t][p] += 1
    return matrix
