import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class ContentEngine:
    def __init__(self, client: Optional[AsyncOpenAI]):
        self.client = client

    async def extract_knowledge_atoms(self, content: str) -> List[Dict[str, Any]]:
        """
        Job: Turn messy information into structured knowledge.
        Librarian Role: Summarize, extract keywords, and detect concepts.
        """
        if not self.client: return []
        
        prompt = f"""
        Analyze the following educational content and extract the core 'atoms' of knowledge (concepts).
        For each concept, provide:
        - title: Concise name.
        - description: Academic definition.
        - simple_explanation: Explain like I'm 12 (Feynman Technique).
        - difficulty: Rating 1-5.
        - summary: A 2-sentence summary.
        
        Content:
        {content}
        
        Return JSON list.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a Librarian specialized in knowledge structuring."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            return result.get("concepts", result) if isinstance(result, dict) else result
        except Exception as e:
            logger.error(f"Librarian Error: {str(e)}")
            return []
