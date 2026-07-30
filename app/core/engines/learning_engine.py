import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI

class LearningEngine:
    def __init__(self, client: Optional[AsyncOpenAI]):
        self.client = client

    async def generate_tutor_guided_session(self, concept: Dict[str, Any], profile: Optional[Any] = None) -> Dict[str, Any]:
        """
        Job: Guide the user through learning.
        Teacher Role: Explain concept -> Ask question -> Give example -> Mini quiz.
        """
        if not self.client: return {}
        
        # Adaptive UI logic
        cog_prefix = f"\nUser is a {profile.learner_type.value} learner." if profile else ""
        
        prompt = f"""
        {cog_prefix}
        As a world-class teacher, generate a 4-step guided learning session for the following concept:
        Concept: {concept.get('title')}
        
        Instructions:
        Step 1: Explain the concept (1 paragraph).
        Step 2: Ask a thought-provoking recall question.
        Step 3: Provide a vivid example or analogy.
        Step 4: Create a 3-question mini quiz.
        
        Return JSON object with 'explanation', 'question', 'example', 'quiz'.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a world-class Teacher specializing in accelerated learning."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception:
            return {}

    async def chat(self, message: str, history: List[Dict[str, str]] = [], system_prompt: Optional[str] = None, user_id: Optional[int] = None) -> str:
        """
        Job: Answer tutor-like questions about the user's research.
        """
        if not self.client:
            return "[Neural Sync Offline] This is a fallback AI response. Please connect your API key for full neural mentorship."

        default_system = "You are NoteFusion AI Mentor. Your job is to help users master their research. Use the chat history to provide context and be a supportive, encouraging world-class tutor."
        
        messages = [
            {"role": "system", "content": system_prompt if system_prompt else default_system}
        ]
        
        # Add history (limit to last 10 messages for token stability)
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": message})
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[AI Error] Neural connection lost: {str(e)}"
