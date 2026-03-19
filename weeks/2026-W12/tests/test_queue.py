from src.queue import InMemoryQueue


def test_ack_removes_inflight():
    q = InMemoryQueue()
    msg = q.enqueue({"task": "alpha"})
    popped = q.dequeue()
    assert popped.id == msg.id
    assert q.metrics()["inflight"] == 1
    assert q.ack(msg.id) is True
    assert q.metrics()["inflight"] == 0


def test_nack_requeues_until_max_retries():
    q = InMemoryQueue(max_retries=2)
    msg = q.enqueue({"task": "beta"})

    for attempt in range(2):
        popped = q.dequeue()
        assert popped.id == msg.id
        assert q.nack(msg.id) is True
        assert q.metrics()["ready"] == 1
        assert q.metrics()["dead"] == 0

    # third nack should send to dead-letter
    popped = q.dequeue()
    assert popped.id == msg.id
    assert q.nack(msg.id) is True
    assert q.metrics()["ready"] == 0
    assert q.metrics()["dead"] == 1


def test_nack_without_requeue_dead_letters_immediately():
    q = InMemoryQueue(max_retries=5)
    msg = q.enqueue({"task": "gamma"})
    popped = q.dequeue()
    assert popped.id == msg.id
    assert q.nack(msg.id, requeue=False) is True
    assert q.metrics()["dead"] == 1
