# Error Analysis Notes

Even a tiny Naive Bayes classifier can produce useful diagnostics. Typical failure modes:

- **Sparse tokens:** Words that appear once can dominate on tiny datasets.
- **Ambiguous sentiment:** Mixed phrases ("good performance but buggy") confuse a unigram model.
- **Out-of-vocabulary terms:** Unknown words fall back to the smoothing prior.

Ideas for improvement:
- Track top contributing tokens per class (by likelihood ratio).
- Add stopword filtering to reduce noise.
- Increase dataset size for more stable priors.
