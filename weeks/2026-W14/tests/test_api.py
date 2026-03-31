from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_faq_route_returns_schema():
    response = client.post("/faq", json={"question": "How does billing work?"})
    assert response.status_code == 200
    body = response.json()
    assert "request_id" in body
    assert "answer" in body
    assert "citations" in body
