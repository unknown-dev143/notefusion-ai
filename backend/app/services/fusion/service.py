<<<<<<< HEAD
from typing import Optional, Dict, List
import openai
import json

class FusionService:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key
        self._cache = {}

    async def generate_notes(
        self,
        lecture_text: str,
        textbook_text: Optional[str] = None,
        module_code: Optional[str] = None,
        chapter: Optional[str] = None,
        detail_level: str = "standard",  # concise, standard, in-depth
    ) -> dict:
        """Generate fused notes from lecture and textbook content"""
        cache_key = f"{lecture_text[:100]}_{textbook_text[:100] if textbook_text else ''}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Prepare the prompt
        prompt = self._prepare_fusion_prompt(
            lecture_text, textbook_text, module_code, chapter, detail_level
        )

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert note-taking assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )

            result = self._parse_gpt_response(response.choices[0].message.content)
            self._cache[cache_key] = result
            return result
        except Exception as e:
            return {"error": str(e), "notes": "", "questions": [], "study_time": 0}

    def _prepare_fusion_prompt(
        self,
        lecture_text: str,
        textbook_text: Optional[str],
        module_code: Optional[str],
        chapter: Optional[str],
        detail_level: str
    ) -> str:
        prompt = f"""Generate structured study notes combining the following content:

Lecture content: {lecture_text}
{"Textbook content: " + textbook_text if textbook_text else ""}
{"Module: " + module_code if module_code else ""}
{"Chapter: " + chapter if chapter else ""}
Detail level: {detail_level}

Please provide:
1. Structured notes with clear headings
2. Source tags [Lecture] or [Book] for each point
3. Key definitions highlighted
4. Important formulas in LaTeX/plain text
5. Section summaries
6. 3 practice questions per major section with answers
7. Estimated study time per section

Format the response as JSON with these keys:
- notes: The formatted notes in markdown
- questions: Array of {question, answer} objects
- study_time: Estimated study time in minutes
"""
        return prompt

    def _parse_gpt_response(self, response: str) -> dict:
        """Parse and validate GPT response"""
        try:
            data = json.loads(response)
            return {
                "notes": data.get("notes", ""),
                "questions": data.get("questions", []),
                "study_time": data.get("study_time", 0)
            }
        except json.JSONDecodeError:
            return {
                "notes": response,
                "questions": [],
                "study_time": 0
            }
=======
from typing import Optional, Dict, List
import openai
import json

class FusionService:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key
        self._cache = {}

    async def generate_notes(
        self,
        lecture_text: str,
        textbook_text: Optional[str] = None,
        module_code: Optional[str] = None,
        chapter: Optional[str] = None,
        detail_level: str = "standard",  # concise, standard, in-depth
    ) -> dict:
        """Generate fused notes from lecture and textbook content"""
        cache_key = f"{lecture_text[:100]}_{textbook_text[:100] if textbook_text else ''}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Prepare the prompt
        prompt = self._prepare_fusion_prompt(
            lecture_text, textbook_text, module_code, chapter, detail_level
        )

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert note-taking assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )

            result = self._parse_gpt_response(response.choices[0].message.content)
            self._cache[cache_key] = result
            return result
        except Exception as e:
            return {"error": str(e), "notes": "", "questions": [], "study_time": 0}

    def _prepare_fusion_prompt(
        self,
        lecture_text: str,
        textbook_text: Optional[str],
        module_code: Optional[str],
        chapter: Optional[str],
        detail_level: str
    ) -> str:
        prompt = f"""Generate structured study notes combining the following content:

Lecture content: {lecture_text}
{"Textbook content: " + textbook_text if textbook_text else ""}
{"Module: " + module_code if module_code else ""}
{"Chapter: " + chapter if chapter else ""}
Detail level: {detail_level}

Please provide:
1. Structured notes with clear headings
2. Source tags [Lecture] or [Book] for each point
3. Key definitions highlighted
4. Important formulas in LaTeX/plain text
5. Section summaries
6. 3 practice questions per major section with answers
7. Estimated study time per section

Format the response as JSON with these keys:
- notes: The formatted notes in markdown
- questions: Array of {question, answer} objects
- study_time: Estimated study time in minutes
"""
        return prompt

    def _parse_gpt_response(self, response: str) -> dict:
        """Parse and validate GPT response"""
        try:
            data = json.loads(response)
            return {
                "notes": data.get("notes", ""),
                "questions": data.get("questions", []),
                "study_time": data.get("study_time", 0)
            }
        except json.JSONDecodeError:
            return {
                "notes": response,
                "questions": [],
                "study_time": 0
            }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
