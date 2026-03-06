# Weekly Focus — 2026-W10

## Theme
- Tiny AI from scratch: Naive Bayes text classifier + evaluation CLI

## Focus Area
- AI

## Primary Language / Stack
- Python 3 (stdlib only)

## Weekly Goal
- Build a minimal, well-tested Naive Bayes classifier that trains on a small text dataset, evaluates accuracy/confusion matrix, and supports a CLI to classify new text.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Sketch tokenizer, data model, and metrics API
- Wed: Implement classifier + tests + CLI
- Thu: Add docs/tutorial + improve dataset
- Fri: Add error analysis notes + simple demo output
- Sat: Refactor + edge-case tests
- Sun: Review + polish README + lessons learned

## Exercises (What to Build)
- Naive Bayes classifier with Laplace smoothing
- Tokenizer for lightweight text normalization
- CLI that trains/evaluates and classifies input text

## Tests (What to Validate)
- Tokenization behavior (lowercase, strip punctuation)
- Classifier predicts expected label on a tiny dataset
- Probability outputs are normalized

## UI Demos (What to Showcase)
- CLI demo run showing accuracy + confusion matrix

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Short explanation of Naive Bayes assumptions, smoothing, and evaluation.

## How To Run
- Install: Python 3.x
- Run tests: `python -m unittest`
- Evaluate: `python -m src.cli --evaluate`
- Classify: `python -m src.cli --text "your text here"`

## Daily Log
- **Daily Entry — 2026-03-04**
  - **Progress:** Implemented tokenizer, Naive Bayes classifier, metrics, and CLI entry point.
  - **Exercises Completed:** Training + inference pipeline; sample dataset loader.
  - **Tests Run:** `python -m unittest` (tokenization + prediction + probability sum).
  - **UI Demo Notes:** CLI prints accuracy + confusion matrix; supports `--text` classification.
  - **Tried / Solved / Learned:** Laplace smoothing keeps rare-word probabilities from zeroing out a class.
- **Daily Entry — 2026-03-05**
  - **Progress:** Added evaluation guidance and expanded the sample dataset for better balance.
  - **Exercises Completed:** Dataset enrichment and evaluation notes.
  - **Tests Run:** `python -m unittest`.
  - **UI Demo Notes:** CLI still prints accuracy + confusion matrix with the expanded dataset.
  - **Tried / Solved / Learned:** Extra samples make probability estimates less brittle on tiny datasets.
- **Daily Entry — 2026-03-06**
  - **Progress:** Added error-analysis notes, demo output, and clarified metrics.
  - **Exercises Completed:** Confusion matrix explanation + demo transcript capture.
  - **Tests Run:** `python -m unittest`.
  - **UI Demo Notes:** `demos/demo_output.txt` captures a full CLI evaluation run.
  - **Tried / Solved / Learned:** Misclassifications often trace back to sparse tokens; highlight top contributing tokens for future improvement.

## Tried / Solved / Learned
- Laplace smoothing and token normalization materially stabilize tiny datasets.
