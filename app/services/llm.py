"""
app/services/llm.py
-------------------
Multi-LLM factory for NoteFusion AI.

How it works
------------
1.  You call  LLMFactory.get_client(max_tokens=N)
2.  The factory looks at how many tokens you need and picks:
      ≤ 150 tokens  →  GPT-3.5-Turbo   (fast & cheap, good for short answers)
      151-500 tokens →  GPT-4o-mini     (better quality, still affordable)
      501-2000 tokens → GPT-4o          (top quality for long / complex tasks)
      > 2000 tokens  →  HuggingFace     (cheapest for very large outputs)
3.  If OpenAI is not configured (no API key) the factory always falls
    back to HuggingFace automatically.

Chat support
------------
Every client now exposes a  chat()  method in addition to  complete()  so
the /chat endpoint can send full conversation history to the model.

Adding a new provider is easy: create a new class that implements both
  async def complete(self, prompt: str, max_tokens: int) -> str
  async def chat(self, messages: list[dict], max_tokens: int) -> str
then add it as a case inside LLMFactory.get_client().
"""

import os
import httpx
from typing import Optional, List, Dict, Any


# ---------------------------------------------------------------------------
# OpenAI base client (shared helpers)
# ---------------------------------------------------------------------------
class _OpenAIBase:
    """Shared OpenAI HTTP helper used by all GPT variants."""

    model: str = "gpt-3.5-turbo"

    def __init__(self) -> None:
        self.api_key: str = os.getenv("OPENAI_API_KEY", "")
        self.base_url: str = "https://api.openai.com/v1"

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    async def complete(self, prompt: str, max_tokens: int = 150) -> str:
        """Single-turn completion (wraps the prompt as a user message)."""
        messages = [{"role": "user", "content": prompt}]
        return await self.chat(messages, max_tokens=max_tokens)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 512,
    ) -> str:
        """Multi-turn chat using the OpenAI Chat Completions API."""
        if not self.api_key:
            return "NoteFusion AI is operating in preview mode. Set OPENAI_API_KEY in your deployment environment variables for full LLM responses."

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=self._headers(),
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# OpenAI – GPT-3.5-Turbo (cheap, fast, good for short answers)
# ---------------------------------------------------------------------------
class OpenAIGPT35Client(_OpenAIBase):
    """GPT-3.5-Turbo: best for quick, short answers."""
    model = "gpt-3.5-turbo"


# ---------------------------------------------------------------------------
# OpenAI – GPT-4o-mini (better quality, still affordable)
# ---------------------------------------------------------------------------
class OpenAIGPT4oMiniClient(_OpenAIBase):
    """GPT-4o-mini: better quality for medium-length responses."""
    model = "gpt-4o-mini"


# ---------------------------------------------------------------------------
# OpenAI – GPT-4o (top quality, for complex / long tasks)
# ---------------------------------------------------------------------------
class OpenAIGPT4oClient(_OpenAIBase):
    """GPT-4o: highest quality OpenAI model, used for long/complex tasks."""
    model = "gpt-4o"


# ---------------------------------------------------------------------------
# HuggingFace – Flan-T5-XL (free tier, good for large outputs)
# ---------------------------------------------------------------------------
class HuggingFaceClient:
    """
    Calls HuggingFace Inference API.
    Set HF_API_KEY in your .env to use gated / paid models.
    Without a key it still works on public models with rate limits.
    """

    model = "google/flan-t5-xl"

    def __init__(self) -> None:
        self.api_key: str = os.getenv("HF_API_KEY", "")
        self.base_url: str = "https://api-inference.huggingface.co/models"

    async def complete(self, prompt: str, max_tokens: int = 512) -> str:
        headers: Dict[str, str] = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": max_tokens},
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/{self.model}", json=payload, headers=headers
            )
            resp.raise_for_status()
            data = resp.json()
            # HuggingFace returns a list of dicts
            if isinstance(data, list) and data:
                return data[0].get("generated_text", str(data))
            return str(data)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 512,
    ) -> str:
        """HuggingFace does not support native chat; flatten history to a prompt."""
        prompt_parts = []
        for m in messages:
            role = m.get("role", "user").capitalize()
            content = m.get("content", "")
            prompt_parts.append(f"{role}: {content}")
        prompt_parts.append("Assistant:")
        return await self.complete("\n".join(prompt_parts), max_tokens=max_tokens)


# ---------------------------------------------------------------------------
# Factory – automatically picks the best client
# ---------------------------------------------------------------------------
class LLMFactory:
    """
    Call  LLMFactory.get_client(max_tokens=N)  anywhere in the app.

    Token tiers
    -----------
    0 – 150    →  GPT-3.5-Turbo   (fast, cheap, great for short answers)
    151 – 500  →  GPT-4o-mini     (better quality for medium responses)
    501 – 2000 →  GPT-4o          (top quality for long / complex tasks)
    > 2000     →  HuggingFace     (cheapest for very large outputs)

    If OPENAI_API_KEY is not set, always uses HuggingFace as fallback.
    """

    @staticmethod
    def _has_openai() -> bool:
        key = os.getenv("OPENAI_API_KEY", "")
        return bool(key and key not in ("", "your_openai_api_key"))

    @staticmethod
    def get_client(max_tokens: int = 256):
        if not LLMFactory._has_openai():
            return HuggingFaceClient()

        if max_tokens <= 150:
            return OpenAIGPT35Client()
        elif max_tokens <= 500:
            return OpenAIGPT4oMiniClient()
        elif max_tokens <= 2000:
            return OpenAIGPT4oClient()
        else:
            return HuggingFaceClient()

    @staticmethod
    def provider_name(max_tokens: int = 256) -> str:
        """Returns a human-readable name of which provider will be used."""
        if not LLMFactory._has_openai():
            return "HuggingFace (flan-t5-xl)"
        if max_tokens <= 150:
            return "OpenAI GPT-3.5-Turbo"
        elif max_tokens <= 500:
            return "OpenAI GPT-4o-mini"
        elif max_tokens <= 2000:
            return "OpenAI GPT-4o"
        else:
            return "HuggingFace (flan-t5-xl)"
