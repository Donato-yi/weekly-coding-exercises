# Demo: Queue lifecycle

```python
from src.queue import InMemoryQueue

q = InMemoryQueue(max_retries=1)
msg = q.enqueue({"task": "index", "priority": 2})

picked = q.dequeue()
q.nack(picked.id)  # retry once

picked = q.dequeue()
q.ack(picked.id)

print(q.metrics())
```

Expected output:
```
{'ready': 0, 'inflight': 0, 'dead': 0}
```
