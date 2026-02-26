# Tutorial Notes — Hashing Vector Search

## Why the hashing trick?
- Avoids building a full vocabulary.
- Uses fixed-size vectors for any input text.

## Core steps
1. Tokenize text
2. Hash each token into a bucket
3. Sum signed counts per bucket
4. Normalize and compare with cosine similarity

## Caveats
- Collisions are expected; bigger `dim` reduces impact.
- Not true semantic embeddings, but good enough for lightweight search.

## Eval Runner CLI Notes
- `--min-score` enforces a passing threshold per case.
- `--fail-fast` stops on the first failing case (useful for CI).
- `--out` writes the markdown report instead of stdout.
