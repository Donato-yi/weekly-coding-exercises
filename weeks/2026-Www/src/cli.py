from __future__ import annotations

import argparse

from .dataset import load_sample_dataset
from .nb_classifier import NaiveBayesClassifier
from .metrics import accuracy, confusion_matrix


def main() -> None:
    parser = argparse.ArgumentParser(description="Tiny Naive Bayes text classifier")
    parser.add_argument("--text", help="Classify a single text string")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for dataset split")
    args = parser.parse_args()

    data = load_sample_dataset(seed=args.seed)
    clf = NaiveBayesClassifier(alpha=1.0)
    clf.fit(data.train)

    y_true = [label for label, _ in data.test]
    y_pred = [clf.predict(text) for _, text in data.test]

    labels = sorted(set(y_true))
    acc = accuracy(y_true, y_pred)
    matrix = confusion_matrix(labels, y_true, y_pred)

    print(f"Accuracy: {acc:.2%}")
    print("Confusion Matrix:")
    for row in labels:
        row_counts = " ".join(f"{matrix[row][col]:2d}" for col in labels)
        print(f"  {row:>7}: {row_counts}")

    if args.text:
        pred = clf.predict(args.text)
        probs = clf.predict_proba(args.text)
        print("\nInput:", args.text)
        print("Predicted label:", pred)
        print("Probabilities:")
        for label, prob in sorted(probs.items(), key=lambda item: item[1], reverse=True):
            print(f"  {label}: {prob:.2%}")


if __name__ == "__main__":
    main()
