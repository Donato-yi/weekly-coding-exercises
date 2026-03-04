# Naive Bayes Mini-Tutorial

## Why It Works
Naive Bayes assumes features (tokens) are conditionally independent given the class. While that assumption is simplistic, it often performs surprisingly well for text classification.

## Key Steps
1. **Tokenize** text into words.
2. **Count** token frequencies per class.
3. **Apply Laplace smoothing** so unseen tokens don’t zero out probabilities.
4. **Compute log-probabilities** to avoid underflow.

## How to Run
```bash
python -m src.cli
python -m src.cli --text "server patch fixes vulnerability"
```

## Suggested Extensions
- Add bigrams
- Use a larger dataset
- Add per-class precision/recall
