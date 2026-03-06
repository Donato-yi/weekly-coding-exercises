"""CLI for training/evaluating the Naive Bayes classifier."""
import argparse
from typing import List

from .dataset import SAMPLES
from .naive_bayes import NaiveBayesClassifier


def load_dataset():
    texts = [text for text, _ in SAMPLES]
    labels = [label for _, label in SAMPLES]
    return texts, labels


def print_confusion(confusion, labels: List[str]):
    header = "actual\\pred".ljust(12) + "".join(l.ljust(12) for l in labels)
    print(header)
    for actual in labels:
        row = actual.ljust(12)
        for pred in labels:
            row += str(confusion[actual].get(pred, 0)).ljust(12)
        print(row)


def main():
    parser = argparse.ArgumentParser(description="Naive Bayes text classifier demo")
    parser.add_argument("--text", type=str, help="Classify a single text input")
    parser.add_argument("--evaluate", action="store_true", help="Evaluate on the sample dataset")
    args = parser.parse_args()

    texts, labels = load_dataset()
    model = NaiveBayesClassifier(alpha=1.0)
    model.fit(texts, labels)

    if args.evaluate:
        accuracy, confusion = model.evaluate(texts, labels)
        print(f"Accuracy: {accuracy:.2f}")
        print("Confusion Matrix:")
        print_confusion(confusion, sorted(set(labels)))
        return

    if args.text:
        probs = model.predict_proba(args.text)
        pred = max(probs.items(), key=lambda kv: kv[1])[0]
        print(f"Prediction: {pred}")
        for label, prob in probs.items():
            print(f"  {label}: {prob:.3f}")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
