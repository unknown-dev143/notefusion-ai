"""
app/routers/chat.py
-------------------
AI Chat endpoint for NoteFusion AI.

Endpoint
--------
POST /api/v1/chat
    Body (JSON):
        {
          "messages": [
            {"role": "system",    "content": "You are a study tutor."},
            {"role": "user",      "content": "Explain Newton's laws."},
            {"role": "assistant", "content": "Sure! Newton's first law..."},
            {"role": "user",      "content": "What about the third law?"}
          ],
          "max_tokens": 512        // optional, default 512
        }
    Response:
        {
          "reply":    "The third law states...",
          "provider": "OpenAI GPT-4o",
          "tokens_used": 512
        }

The router automatically picks the best LLM for the requested output
length (see app/services/llm.py for tier details).
If no system prompt is provided we inject a friendly, subject-aware
default tutor persona so the experience is great out of the box.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import get_current_active_user
from app.models.user import User
from app.services.llm import LLMFactory

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Default system prompt (used when the caller does not supply one)
# ---------------------------------------------------------------------------
_DEFAULT_SYSTEM_PROMPT = (
    "You are NoteFusion AI, an intelligent study tutor and personal learning assistant. "
    "You help students understand complex topics clearly, create effective study plans, "
    "summarise notes, generate quiz questions, and explain concepts at any depth level. "
    "Be concise, precise, and encouraging. "
    "When you don't know something, say so rather than guessing."
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str = Field(..., description="One of: system, user, assistant")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(
        ...,
        min_length=1,
        description="Conversation history, ordered oldest → newest.",
    )
    max_tokens: Optional[int] = Field(
        default=512,
        ge=50,
        le=4000,
        description="Maximum tokens for the reply (50–4000). Picks best model automatically.",
    )


class ChatResponse(BaseModel):
    reply: str
    provider: str
    tokens_used: int


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=ChatResponse,
    summary="Chat with the NoteFusion AI tutor",
    description=(
        "Send a conversation history (list of messages with role + content) "
        "and receive an AI reply. The model is chosen automatically based on "
        "requested output length: GPT-3.5 → GPT-4o-mini → GPT-4o → HuggingFace."
    ),
)
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_active_user),
) -> ChatResponse:
    """Chat endpoint: forwards message history to the best available LLM."""

    # Build the message list for the API
    messages = [m.model_dump() for m in body.messages]

    # Inject a system prompt if none was supplied by the caller
    has_system = any(m["role"] == "system" for m in messages)
    if not has_system:
        messages.insert(0, {"role": "system", "content": _DEFAULT_SYSTEM_PROMPT})

    max_tokens = body.max_tokens or 512
    client = LLMFactory.get_client(max_tokens=max_tokens)
    provider = LLMFactory.provider_name(max_tokens=max_tokens)

    try:
        reply = await client.chat(messages=messages, max_tokens=max_tokens)
    except Exception as exc:
        logger.error("LLM chat error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(exc)}",
        )

    return ChatResponse(
        reply=reply,
        provider=provider,
        tokens_used=max_tokens,
    )
