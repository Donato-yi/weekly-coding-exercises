# Weekly Focus — 2026-W14

## Theme
- Eval-first AI FAQ router with lightweight retrieval + guardrails

## Focus Area
- AI

## Primary Language / Stack
- Python + FastAPI + OpenAI SDK + SQLite + Pydantic

## Weekly Goal
- Build a small AI FAQ router that retrieves relevant snippets, enforces safety constraints, and logs evals for prompt/regression testing.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Set up FastAPI service + prompt templates + response schema
- Wed: Build retrieval layer (SQLite + embedding cache) + simple relevance scoring
- Thu: Add safety checks (blocked topics, citation requirements) + logging
- Fri: Add eval harness + baseline test set + scoring summary
- Sat: Add demo notes + minimal UI notes (curl/HTTP examples)
- Sun: Refactor + summarize lessons learned + next steps

## Exercises (What to Build)
- Retrieval-backed FAQ route with citations
- Safety filter + refusal policy for out-of-scope requests
- Eval harness to compare prompt versions on a fixed dataset

## Tests (What to Validate)
- Retrieval returns top-k relevant snippets for seeded queries
- Safety filter blocks disallowed topics deterministically
- Evals produce stable scores across prompt versions

## UI Demos (What to Showcase)
- Example queries (in/out of scope) with expected responses
- Eval summary table (accuracy / refusal rate / citation coverage)

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Keep prompts versioned and evaluated with a fixed test set.
- Prefer deterministic safety checks before model calls.
- Require citations to reduce hallucination risk.

## Daily Log
- **Daily Entry — 2026-03-30**
  - **Progress:** Planned weekly focus, stack, and milestones.
  - **Exercises Completed:** Planning only (Monday).
  - **Tests Run:** Not applicable.
  - **UI Demo Notes:** Not applicable.
  - **Tried / Solved / Learned:** AI systems need eval harnesses from day one to prevent silent regressions.

- **Daily Entry — 2026-03-31**
  - **Progress:** Set up FastAPI app skeleton, request/response schema, and prompt templates. Added a simple in-memory retrieval stub for dev flows.
  - **Exercises Completed:** API scaffolding + schema validation + prompt template module.
  - **Tests Run:** Not run (added pytest coverage for schema + endpoint shape).
  - **UI Demo Notes:** Added curl examples in demos/README.md.
  - **Tried / Solved / Learned:** Keeping prompts and schema isolated early makes later evals/refactors cleaner.

- **Daily Entry — 2026-04-01**
  - **Progress:** Replaced the retrieval stub with a SQLite-backed store, added hashed embedding caching, and introduced weighted relevance scoring (cosine + lexical overlap).
  - **Exercises Completed:** SQLite schema + embedding cache + retrieval scoring implementation.
  - **Tests Run:** Added retrieval unit test (not executed here).
  - **UI Demo Notes:** Documented the new data store path in demos and docs.
  - **Tried / Solved / Learned:** Simple, deterministic embeddings are enough for early ranking tests without external dependencies.

- **Daily Entry — 2026-04-02**
  - **Progress:** Added safety guardrails (blocklist + citation requirement) and JSONL logging for request routing decisions.
  - **Exercises Completed:** Implemented `safety.py`, `logging_utils.py`, and updated API handling flow.
  - **Tests Run:** Added safety unit tests (not executed here).
  - **UI Demo Notes:** None today.
  - **Tried / Solved / Learned:** Logging request metadata early makes evals and audits much easier later.

- **Daily Entry — 2026-04-04**
  - **Progress:** Expanded demo notes with UI/response expectations and additional curl examples for handoff + blocked flows.
  - **Exercises Completed:** Documented happy-path, handoff, and refusal scenarios in demos/README.md.
  - **Tests Run:** Not run (documentation-only change).
  - **UI Demo Notes:** Added guidance for expected route/safety_status outputs per scenario.
  - **Tried / Solved / Learned:** Clear demo scenarios make it easier to validate guardrails without a full UI.

## Tried / Solved / Learned
- Evals and safety checks should be part of the core architecture, not add-ons.
- Deterministic hashed embeddings give a quick baseline before swapping in real vector models.
- Guardrails + logging together create a clearer audit trail for FAQ routing behavior.
