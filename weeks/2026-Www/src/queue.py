from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Deque, Dict, Optional
import uuid


@dataclass
class Message:
    id: str
    payload: dict
    attempts: int = 0
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class InMemoryQueue:
    def __init__(self, max_retries: int = 3) -> None:
        if max_retries < 0:
            raise ValueError("max_retries must be >= 0")
        self.max_retries = max_retries
        self._ready: Deque[Message] = deque()
        self._inflight: Dict[str, Message] = {}
        self._dead: Deque[Message] = deque()

    def enqueue(self, payload: dict, msg_id: Optional[str] = None) -> Message:
        message = Message(id=msg_id or str(uuid.uuid4()), payload=payload)
        self._ready.append(message)
        return message

    def dequeue(self) -> Optional[Message]:
        if not self._ready:
            return None
        message = self._ready.popleft()
        self._inflight[message.id] = message
        return message

    def ack(self, msg_id: str) -> bool:
        return self._inflight.pop(msg_id, None) is not None

    def nack(self, msg_id: str, requeue: bool = True) -> bool:
        message = self._inflight.pop(msg_id, None)
        if message is None:
            return False

        message.attempts += 1
        if not requeue or message.attempts > self.max_retries:
            self._dead.append(message)
        else:
            self._ready.append(message)
        return True

    def metrics(self) -> dict:
        return {
            "ready": len(self._ready),
            "inflight": len(self._inflight),
            "dead": len(self._dead),
        }

    def dead_letter(self) -> Deque[Message]:
        return self._dead
