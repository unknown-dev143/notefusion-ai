from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

from .content_engine import ContentEngine
from .learning_engine import LearningEngine
from .recall_engine import RecallEngine
from .knowledge_engine import KnowledgeEngine
from .analytics_engine import AnalyticsEngine

class NoteFusionBrain:
    """
    The Orchestrator.
    Coords: Librarian, Teacher, Memory Trainer, Researcher, Coach.
    """
    def __init__(self):
        try:
            # Fallback for environment-specific proxy issues with httpx 0.27+
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        except TypeError as e:
            if "proxies" in str(e):
                import httpx
                # Manually create client without proxies to fix the library incompatibility
                http_client = httpx.AsyncClient()
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, http_client=http_client) if settings.OPENAI_API_KEY else None
            else:
                raise e
        except Exception:
            client = None
        
        self.librarian = ContentEngine(client)     # Content Engine
        self.teacher = LearningEngine(client)       # Learning Engine
        self.memory = RecallEngine()                # Recall Engine
        self.researcher = KnowledgeEngine(client)   # Knowledge Engine
        self.coach = AnalyticsEngine()              # Analytics Engine

try:
    brain = NoteFusionBrain()
except Exception:
    # Fail gracefully if brain fails to initialize entirely
    brain = None
