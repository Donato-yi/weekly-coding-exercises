# Notes

- Prompt templates live in `src/prompts.py`.
- Response schema is defined in `src/models.py`.
- Retrieval now stores snippets in SQLite with cached embeddings (hashed bag-of-words).
- Default DB path: `data/faq.db` (auto-seeded on first run).
