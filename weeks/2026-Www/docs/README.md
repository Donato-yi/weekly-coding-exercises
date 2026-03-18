# In-Memory Queue — Notes

## Why ack/nack matters
- **Ack** confirms processing success and removes the message from inflight.
- **Nack** signals a failure; with retries enabled it requeues, otherwise it routes to the dead-letter queue.

## Retry + Dead-letter pattern
- Retries absorb transient failures.
- Dead-letter preserves failed messages for inspection instead of losing them.

## Usage
```python
from src.queue import InMemoryQueue

queue = InMemoryQueue(max_retries=2)
queue.enqueue({"job": "sync"})

msg = queue.dequeue()
queue.nack(msg.id)  # retry once
```
