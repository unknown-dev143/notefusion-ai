import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class KnowledgeEngine:
    """
    Job: Link concepts together.
    Researcher Role: Identifies prerequisites and foundational gaps.
    """
    def __init__(self, client: Optional[AsyncOpenAI]):
        self.client = client

    async def detect_knowledge_graph_gaps(self, current_concepts: List[str]) -> List[Dict[str, Any]]:
        """
        Runs in background to find missing prerequisites.
        Researcher detects: 'Foundational Gaps' (Algebra needed for Calculus).
        """
        if not self.client: return []
        
        prompt = f"""
        Given the user's current knowledge graph: {current_concepts}
        Identify 3 critical 'Foundational Gaps' or 'Missing Prerequisites' that would improve their understanding.
        Ex: If user knows 'Derivatives', suggest 'Limits' or 'Algebra II'.
        Return JSON list of {{concept, reason}}.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a specialized Knowledge Researcher specialized in curriculum mapping."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            return result.get("gaps", result) if isinstance(result, dict) else result
        except Exception as e:
            logger.error(f"Researcher Error: {str(e)}")
            return []
