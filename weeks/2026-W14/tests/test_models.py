from src.models import FAQRequest, FAQResponse, Citation


def test_request_validation():
    payload = FAQRequest(question="How does billing work?", user_id="u1")
    assert payload.locale == "en-US"


def test_response_schema():
    response = FAQResponse(
        request_id="req-1",
        route="faq",
        safety_status="ok",
        answer="Answer",
        citations=[
            Citation(
                source_id="s1",
                title="Billing",
                url="https://example.com",
                snippet="Monthly billing.",
            )
        ],
        confidence=0.8,
        model="stub",
    )
    assert response.citations[0].source_id == "s1"
