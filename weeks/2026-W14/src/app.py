from __future__ import annotations

import uuid
from typing import List

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from .models import FAQRequest, FAQResponse, Citation
from .retrieval import retrieve
from .prompts import SYSTEM_PROMPT, format_prompt

app = FastAPI(title="FAQ Router", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/faq", response_model=FAQResponse)
async def faq_route(payload: FAQRequest) -> FAQResponse:
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

    if not citations:
        return FAQResponse(
            request_id=str(uuid.uuid4()),
            route="handoff",
            safety_status="needs_review",
            answer="I don’t have enough context to answer yet. Can you clarify your request?",
            citations=[],
            confidence=0.2,
            model="stub",
        )

    prompt = format_prompt(payload.question, "\n".join(f"- {c.snippet}" for c in citations))
    # TODO: replace with model call + safety checks
    answer = (
        "Based on the current policy, here is a concise answer. "
        "(Model call placeholder.)"
    )

    return FAQResponse(
        request_id=str(uuid.uuid4()),
        route="faq",
        safety_status="ok",
        answer=f"{answer}\n\nPrompt Context:\n{SYSTEM_PROMPT}\n{prompt}",
        citations=citations,
        confidence=0.55,
        model="stub",
    )


@app.exception_handler(Exception)
async def generic_error_handler(request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": str(exc)})
