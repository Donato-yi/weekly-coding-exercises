# Demo Notes

## Quick Start (local)
```bash
pip install fastapi uvicorn pydantic
uvicorn src.app:app --reload
```

## Example Queries
```bash
curl -s http://127.0.0.1:8000/health

curl -s http://127.0.0.1:8000/faq \
  -H "Content-Type: application/json" \
  -d '{"question":"How does billing work?"}'
```

## Data Notes
- SQLite store: `data/faq.db` (auto-seeded with default FAQ snippets).
