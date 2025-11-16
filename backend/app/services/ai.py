"""
AI service for handling note generation and audio transcription.
"""
import os
import logging
from typing import List,  Dict, Any, Optional
import openai
from openai import AsyncOpenAI

# Configure logging
logger = logging.getLogger(__name__)

class AIService:
    """Service for handling AI-related operations."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI service with an API key."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("No OpenAI API key provided. Some features may not work.")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
    
    async def generate_note_content(
        self,
        note_content: str,
        prompt: str,
        language: str = "en",
        style: str = "default",
        length: str = "medium"
    ) -> str:
        """
        Generate note content using AI.
        
        Args:
            note_content: The existing note content to work with
            prompt: The user's instructions for generation
            language: Language for the generated content
            style: Writing style (e.g., "academic", "casual", "professional")
            length: Desired length of the output ("short", "medium", "long")
            
        Returns:
            Generated note content
        """
        if not self.api_key:
            raise ValueError("OpenAI API key is required for content generation")
        
        try:
            # Prepare the prompt for the AI
            system_prompt = (
                f"You are a helpful AI assistant that helps with note-taking and content generation. "
                f"Generate content in {language} with a {style} style. "
                f"The output should be {length} in length. "
                "Format the response in Markdown with appropriate headings and formatting."
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Existing notes:\n{note_content}\n\nInstructions: {prompt}"}
            ]
            
            # Call the OpenAI API
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating note content: {str(e)}", exc_info=True)
            raise Exception(f"Failed to generate content: {str(e)}")
    
    async def transcribe_audio(self, file_path: str) -> str:
        """
        Transcribe an audio file to text.
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Transcribed text
        """
        if not self.api_key:
            raise ValueError("OpenAI API key is required for audio transcription")
        
        try:
            with open(file_path, "rb") as audio_file:
                transcription = await self.client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1",
                    response_format="text"
                )
            return transcription
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}", exc_info=True)
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    async def generate_flashcards(
        self,
        content: str,
        count: int = 10,
        language: str = "en"
    ) -> list:
        """
        Generate flashcards from note content.
        
        Args:
            content: The note content to generate flashcards from
            count: Number of flashcards to generate
            language: Language for the flashcards
            
        Returns:
            List of flashcards, each with 'front' and 'back' fields
        """
        if not self.api_key:
            raise ValueError("OpenAI API key is required for flashcard generation")
        
        try:
            system_prompt = (
                f"Generate {count} flashcards from the provided content. "
                f"Each flashcard should have a clear question (front) and answer (back). "
                f"The flashcards should be in {language}. "
                "Return ONLY a JSON array of objects with 'front' and 'back' fields. "
                "Do not include any other text in the response."
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ]
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            # Parse and return the flashcards
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get("flashcards", [])
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}", exc_info=True)
            raise Exception(f"Failed to generate flashcards: {str(e)}")
