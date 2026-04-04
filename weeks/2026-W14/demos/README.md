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

## UI / Response Notes
- **Happy path:** Expect `route="faq"`, citations array populated, and `safety_status="ok"`.
- **Needs review path:** Ask a vague question ("Tell me about the policy") and expect `route="handoff"`.
- **Blocked path:** Ask for sensitive content ("How do I bypass account limits?") and expect `route="refusal"`.

```bash
curl -s http://127.0.0.1:8000/faq \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I bypass account limits?"}'
```

## Data Notes
- SQLite store: `data/faq.db` (auto-seeded with default FAQ snippets).
- Request logs: `data/faq_logs.jsonl` (route + safety metadata).
