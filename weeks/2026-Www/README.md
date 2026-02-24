# Weekly Focus — 2026-W09

## Theme
- AI‑lite retrieval: hashing vectorizer + cosine search for local docs

## Focus Area
- AI

## Primary Language / Stack
- Python 3.11 (stdlib + pytest)

## Weekly Goal
- Build a tiny local search engine that turns text into fixed‑size vectors and ranks documents by cosine similarity.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Implement hashing vectorizer + document index, add core tests
- Wed: Add CLI and sample dataset loader
- Thu: Add weighting tweaks (TF normalization) + relevance tuning notes
- Fri: Expand tests + edge cases (empty docs, stopwords)
- Sat: Write tutorial notes + usage demo
- Sun: Polish, refactor, and finalize README

## Exercises (What to Build)
- HashingVectorizer (tokenize → hash → vector)
- DocumentIndex with add/search APIs
- Simple CLI for searching a folder of notes

## Tests (What to Validate)
- Tokenization and deterministic hashing
- Cosine similarity correctness
- Search ranking order for known inputs

## UI Demos (What to Showcase)
- Terminal demo: query → ranked results with scores

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Hashing trick gives fixed‑size vectors without a vocab.
- Normalize vectors to compare with cosine similarity.

## Daily Log

### Daily Entry — 2026-02-24

**Progress**
- Implemented hashing vectorizer + document index.
- Added cosine similarity and ranking.
- Wrote pytest coverage for core behaviors.

**Exercises Completed**
- HashingVectorizer
- DocumentIndex.search

**Tests Run**
- pytest

**UI Demo Notes**
- Added a demo snippet showing ranked output and scores.

## Tried / Solved / Learned
- Tried: using a fixed dimension and hashing tokens for compact vectors.
- Solved: deterministic hashing (stable seed) + normalized cosine scores.
- Learned: even simple hashing vectors can be surprisingly usable for local search.

## How To Run
```bash
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest
python -m src.cli --query "vector search" --docs ./demos/sample_docs
```
