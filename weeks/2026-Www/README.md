# Weekly Focus — 2026-W12

## Theme
- In-memory work queue architecture: retries, dead-letter, and metrics

## Focus Area
- architecture

## Primary Language / Stack
- Python 3.12 + pytest

## Weekly Goal
- Build a small, testable in-memory queue with ack/nack, retry handling, dead-letter routing, and basic metrics. Provide a usage demo and short tutorial notes about reliability patterns.

## Plan (Mon → Sun)
- Mon: Define goal + plan only
- Tue: Implement core queue data structures + message model
- Wed: Add ack/nack + retry + dead-letter + metrics + tests
- Thu: Add docs/tutorial + usage demo
- Fri: Add edge cases (ordering, empty queue behavior) + tests
- Sat: Add integration-style tests + polish docs
- Sun: Review, refactor, and summarize lessons learned

## Exercises (What to Build)
- Message model with attempts + timestamps
- Queue with enqueue/dequeue/ack/nack
- Retry logic + dead-letter queue
- Metrics summary (ready/inflight/dead)

## Tests (What to Validate)
- Ack removes inflight messages
- Nack requeues with incremented attempts
- Dead-letter after max retries
- Metrics reflect queue state

## UI Demos (What to Showcase)
- Example usage snippet + sample output

## Repo Structure
- /src
- /tests
- /demos
- /docs

## Tutorial Notes
- Idempotency and retries
- Dead-letter queues as safety valves

## Daily Log
- **Daily Entry — 2026-03-18**
  - **Progress:** Implemented queue, retry/dead-letter behavior, and metrics. Wrote initial tests and demo snippet.
  - **Exercises Completed:** Core queue API + message model; retry/ack/nack flows.
  - **Tests Run:** `pytest -q`
  - **UI Demo Notes:** Example shows enqueue → dequeue → ack/nack flow.
  - **Tried / Solved / Learned:** Keeping inflight tracking explicit makes retry semantics clearer.

## Tried / Solved / Learned
- Clear inflight tracking simplifies retry and dead-letter behavior.
