from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class FAQRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    user_id: Optional[str] = Field(default=None, max_length=120)
    locale: Optional[str] = Field(default="en-US", max_length=20)


class Citation(BaseModel):
    source_id: str
    title: str
    url: str
    snippet: str


class FAQResponse(BaseModel):
    request_id: str
    route: Literal["faq", "refusal", "handoff"]
    safety_status: Literal["ok", "blocked", "needs_review"]
    answer: str
    citations: List[Citation]
    confidence: float = Field(..., ge=0.0, le=1.0)
    model: str
