from __future__ import annotations

import uuid
from typing import List

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from .models import FAQRequest, FAQResponse, Citation
from .retrieval import retrieve
from .prompts import SYSTEM_PROMPT, format_prompt
from .safety import ensure_citations, is_blocked
from .logging_utils import log_event

app = FastAPI(title="FAQ Router", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/faq", response_model=FAQResponse)
async def faq_route(payload: FAQRequest) -> FAQResponse:
    request_id = str(uuid.uuid4())
    snippets = retrieve(payload.question)
    citations: List[Citation] = [
        Citation(
            source_id=s.source_id,
            title=s.title,
            url=s.url,
            snippet=s.snippet,
        )
        for s in snippets
    ]

    blocked = is_blocked(payload.question)
    if not blocked.allowed:
        response = FAQResponse(
            request_id=request_id,
            route="refusal",
            safety_status="blocked",
            answer=(
                "I can’t help with that request. If you have an account or product question, "
                "please rephrase it without sensitive details."
            ),
            citations=[],
            confidence=0.05,
            model="stub",
        )
        log_event(
            {
                "request_id": request_id,
                "user_id": payload.user_id,
                "question": payload.question,
                "route": response.route,
                "safety_status": response.safety_status,
                "blocked_reason": blocked.reason,
                "citations_count": 0,
                "confidence": response.confidence,
            }
        )
        return response

    citation_check = ensure_citations(citations)
    if not citation_check.allowed:
        response = FAQResponse(
            request_id=request_id,
            route="handoff",
            safety_status="needs_review",
            answer="I don’t have enough context to answer yet. Can you clarify your request?",
            citations=[],
            confidence=0.2,
            model="stub",
        )
        log_event(
            {
                "request_id": request_id,
                "user_id": payload.user_id,
                "question": payload.question,
                "route": response.route,
                "safety_status": response.safety_status,
                "blocked_reason": citation_check.reason,
                "citations_count": 0,
                "confidence": response.confidence,
            }
        )
        return response

    prompt = format_prompt(payload.question, "\n".join(f"- {c.snippet}" for c in citations))
    # TODO: replace with model call
    answer = "Based on the current policy, here is a concise answer. (Model call placeholder.)"

    response = FAQResponse(
        request_id=request_id,
        route="faq",
        safety_status="ok",
        answer=answer,
        citations=citations,
        confidence=0.55,
        model="stub",
    )
    log_event(
        {
            "request_id": request_id,
            "user_id": payload.user_id,
            "question": payload.question,
            "route": response.route,
            "safety_status": response.safety_status,
            "blocked_reason": None,
            "citations_count": len(citations),
            "confidence": response.confidence,
        }
    )
    return response


@app.exception_handler(Exception)
async def generic_error_handler(request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": str(exc)})
