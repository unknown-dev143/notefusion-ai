import openai
import os
import json
import asyncio
from typing import Dict, List, Optional
import uuid
from datetime import datetime

class FusionService:
    def __init__(self):
        # Initialize OpenAI client with fallback for missing API key
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your_openai_api_key_here":
            self.client = openai.OpenAI(api_key=api_key)
            self.openai_available = True
        else:
            self.client = None
            self.openai_available = False
            print("Warning: OpenAI API key not set. AI features will use fallback methods.")
        
    async def fuse_content(
        self,
        lecture_content: str,
        textbook_content: str,
        module_code: str,
        chapters: str,
        detail_level: str = "standard",
        table_of_contents: Optional[str] = None,
        lecture_timestamps: Optional[str] = None
    ) -> Dict:
        """
        Fuse lecture and textbook content into structured notes using GPT-4
        
        Args:
            lecture_content: Transcribed lecture content
            textbook_content: Textbook excerpts or content
            module_code: Course module code (e.g., ENGG1103)
            chapters: Specific chapters covered
            detail_level: "concise", "standard", or "in-depth"
            table_of_contents: Optional, user-provided TOC for improved segmentation
            lecture_timestamps: Optional, user-provided timestamps for segmentation
        
        Returns:
            Dict containing structured notes with sections, practice questions, etc.
        """
        try:
            # Create prompt for GPT-4
            prompt = self._create_fusion_prompt(
                lecture_content, textbook_content, module_code, chapters, detail_level,
                table_of_contents=table_of_contents, lecture_timestamps=lecture_timestamps
            )
            
            # Call OpenAI API
            response = await self._call_openai(prompt)
            
            # Parse response into structured format
            structured_notes = self._parse_fusion_response(response)
            
            return structured_notes
            
        except Exception as e:
            raise Exception(f"Content fusion failed: {str(e)}")
    
    def _create_fusion_prompt(
        self,
        lecture_content: str,
        textbook_content: str,
        module_code: str,
        chapters: str,
        detail_level: str,
        table_of_contents: Optional[str] = None,
        lecture_timestamps: Optional[str] = None
    ) -> str:
        """Create the prompt for GPT-4 fusion"""
        
        detail_instructions = {
            "concise": "Focus on key points and essential information only. Keep sections brief.",
            "standard": "Provide balanced coverage with main concepts and supporting details.",
            "in-depth": "Include comprehensive coverage with detailed explanations, examples, and connections."
        }
        
        prompt = f"""
You are an expert academic note-taking assistant. Your task is to fuse lecture content and textbook material into comprehensive, well-structured study notes.

MODULE: {module_code}
CHAPTERS: {chapters}
DETAIL LEVEL: {detail_level} - {detail_instructions.get(detail_level, detail_instructions['standard'])}

LECTURE CONTENT:
{lecture_content}

TEXTBOOK CONTENT:
{textbook_content}

TABLE OF CONTENTS (if provided):
{table_of_contents or '[None]'}

LECTURE TIMESTAMPS (if provided):
{lecture_timestamps or '[None]'}

ADVANCED INSTRUCTIONS:
1. Segment the notes by logical units: chapters, sections, timestamps, or clear headings. Use cues like 'Chapter 1:', 'Section 2.3', '[00:10:23]', or slide headings to split content.
2. If a table of contents or timestamps are provided, use them to guide and improve sectioning and segmentation. Align sections and headings with these cues as much as possible.
3. For each section, provide:
   - A clear title (e.g., chapter/section/topic name, or timestamp interval)
   - If available, the start_time or time interval (e.g., "00:10:23")
   - A content array with bullet points, headings, and examples
   - Tag each bullet with [Lecture], [Book], or [Combined] and the context (e.g., [Lecture][Chapter 2])
   - Key definitions and important concepts
   - Section summary ("Key Takeaways")
   - 3 practice questions with detailed answers
   - Estimated study time for the section
4. Use context cues and metadata to maximize accuracy and organization.
5. Output should be a structured JSON with a 'sections' array, each with 'title', 'start_time' (if available), and 'content'.
6. Use clear formatting with bullet points and sub-bullets. Present formulas in LaTeX if needed.
7. If you detect a table of contents or chapter list, use it to guide sectioning.

OUTPUT FORMAT (JSON):
{
    "sections": [
        {
            "title": "Section Title or Time Interval",
            "start_time": "00:10:23" (if available),
            "content": [
                {
                    "type": "heading",
                    "text": "Subsection",
                    "source": "[Lecture][Chapter 2]" or similar
                },
                {
                    "type": "bullet",
                    "text": "Content point",
                    "source": "[Lecture] or [Book]"
                },
                {
                    "type": "definition",
                    "text": "Key definition",
                    "source": "[Lecture] or [Book]"
                }},
                {{
                    "type": "example",
                    "text": "Illustrative example",
                    "source": "[Lecture] or [Book]"
                }}
            ],
            "key_takeaways": ["Point 1", "Point 2", "Point 3"],
            "estimated_study_time_minutes": 15,
            "practice_questions": [
                {{
                    "question": "Question text",
                    "answer": "Detailed answer",
                    "type": "multiple_choice"
                }}
            ]
        }
    ],
    "total_estimated_study_time_minutes": 120,
    "summary": "Brief overview of the entire content"
}}

Please provide the response in valid JSON format.
"""
        return prompt
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API with the fusion prompt"""
        if not self.openai_available:
            # Return fallback content when OpenAI is not available
            return self._generate_fallback_content(prompt)
        
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are an expert academic note-taking assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=4000
                )
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"OpenAI API call failed: {str(e)}")
            return self._generate_fallback_content(prompt)
    
    def _generate_fallback_content(self, prompt: str) -> str:
        """Generate fallback content when OpenAI is not available"""
        return """
{
    "sections": [
        {
            "title": "Combined Study Notes",
            "content": [
                {
                    "type": "text",
                    "text": "Content fusion requires OpenAI API key. Please set OPENAI_API_KEY environment variable for AI-powered note generation.",
                    "source": "[System]"
                }
            ],
            "key_takeaways": ["AI features require API key configuration"],
            "estimated_study_time_minutes": 15,
            "practice_questions": []
        }
    ],
    "total_estimated_study_time_minutes": 15,
    "summary": "Notes generation requires OpenAI API configuration",
    "generated_at": "2024-01-01T00:00:00",
    "fusion_id": "fallback-123",
    "fallback_mode": true
}
"""
    
    def _parse_fusion_response(self, response: str) -> Dict:
        """Parse the GPT-4 response into structured format"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            # Parse JSON
            structured_notes = json.loads(json_str)
            
            # Add metadata
            structured_notes["generated_at"] = datetime.now().isoformat()
            structured_notes["fusion_id"] = str(uuid.uuid4())
            
            return structured_notes
            
        except json.JSONDecodeError as e:
            # Fallback: create basic structure from text
            return self._create_fallback_structure(response)
        except Exception as e:
            raise Exception(f"Failed to parse fusion response: {str(e)}")
    
    def _create_fallback_structure(self, response: str) -> Dict:
        """Create fallback structure if JSON parsing fails"""
        return {
            "sections": [
                {
                    "title": "Combined Notes",
                    "content": [
                        {
                            "type": "text",
                            "text": response,
                            "source": "[Combined]"
                        }
                    ],
                    "key_takeaways": ["Content has been combined from lecture and textbook"],
                    "estimated_study_time_minutes": 30,
                    "practice_questions": []
                }
            ],
            "total_estimated_study_time_minutes": 30,
            "summary": "Notes generated from lecture and textbook content",
            "generated_at": datetime.now().isoformat(),
            "fusion_id": str(uuid.uuid4()),
            "parse_error": True
        }
    
    async def generate_practice_questions(self, content: str, section_name: str) -> List[Dict]:
        """Generate practice questions for a specific section"""
        try:
            prompt = f"""
Generate 3 practice questions for the following content section:

SECTION: {section_name}
CONTENT: {content}

Generate 3 diverse practice questions:
1. One multiple choice question
2. One short answer question  
3. One application/problem-solving question

Format as JSON:
{{
    "questions": [
        {{
            "question": "Question text",
            "answer": "Detailed answer",
            "type": "multiple_choice",
            "options": ["A", "B", "C", "D"] // for multiple choice
        }}
    ]
}}
"""
            
            response = await self._call_openai(prompt)
            
            # Parse response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            questions_data = json.loads(json_str)
            return questions_data.get("questions", [])
            
        except Exception as e:
            print(f"Failed to generate practice questions: {e}")
            return []
    
    async def generate_flashcards(self, notes_content: str) -> List[Dict]:
        """Generate Anki-style flashcards from notes content"""
        try:
            prompt = f"""
Create Anki-style flashcards from the following notes content:

CONTENT: {notes_content}

Generate flashcards in this format:
{{
    "flashcards": [
        {{
            "front": "Question or concept",
            "back": "Answer or explanation",
            "tags": ["tag1", "tag2"]
        }}
    ]
}}

Focus on key concepts, definitions, and important facts.
"""
            
            response = await self._call_openai(prompt)
            
            # Parse response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            flashcards_data = json.loads(json_str)
            return flashcards_data.get("flashcards", [])
            
        except Exception as e:
            print(f"Failed to generate flashcards: {e}")
            return []
    
    def estimate_study_time(self, content: str) -> Dict:
        """Estimate study time based on content length and complexity"""
        words = content.split()
        word_count = len(words)
        
        # Base reading speed: 200-250 words per minute
        base_wpm = 225
        
        # Adjust for complexity (definitions, formulas, etc.)
        complexity_factor = 1.2  # 20% slower for academic content
        
        estimated_minutes = (word_count / base_wpm) * complexity_factor
        
        return {
            "word_count": word_count,
            "estimated_minutes": round(estimated_minutes, 1),
            "estimated_seconds": round(estimated_minutes * 60),
            "reading_speed_wpm": base_wpm,
            "complexity_factor": complexity_factor
        } 