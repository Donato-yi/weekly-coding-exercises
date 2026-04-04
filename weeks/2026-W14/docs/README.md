# Notes

- Prompt templates live in `src/prompts.py`.
- Response schema is defined in `src/models.py`.
- Retrieval now stores snippets in SQLite with cached embeddings (hashed bag-of-words).
- Default DB path: `data/faq.db` (auto-seeded on first run).
- Safety checks live in `src/safety.py` (blocklist + citation requirement).
- Request routing is logged to `data/faq_logs.jsonl` for later eval review.
- Demo curl examples live in `demos/README.md`, including blocked + handoff flows.
