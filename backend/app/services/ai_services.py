"""AI-powered services for NoteFusion AI."""
import os
from typing import List, Dict, Optional, Union
import openai
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

class AIServiceError(Exception):
    """Base exception for AI service errors."""
    pass

class SummaryRequest(BaseModel):
    """Request model for text summarization."""
    text: str = Field(..., min_length=50, description="The text to summarize")
    summary_length: str = Field("medium", description="Length of the summary (short, medium, long)")
    focus: Optional[str] = Field(None, description="Optional focus area for the summary")

class SummaryResponse(BaseModel):
    """Response model for text summarization."""
    summary: str
    original_length: int
    summary_length: int
    reduction: float

class Flashcard(BaseModel):
    """Model for a single flashcard."""
    front: str
    back: str
    tags: List[str] = []
    difficulty: str = "medium"  # easy, medium, hard

class FlashcardDeck(BaseModel):
    """Model for a deck of flashcards."""
    title: str
    description: str
    cards: List[Flashcard]
    tags: List[str] = []

class AIService:
    """Service for AI-powered features."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI service."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        openai.api_key = self.api_key
        self.model = "gpt-3.5-turbo"
    
    async def generate_summary(self, request: SummaryRequest) -> SummaryResponse:
        """
        Generate a summary of the provided text using AI.
        
        Args:
            request: Summary request containing text and options
            
        Returns:
            SummaryResponse with the generated summary and metadata
        """
        try:
            # Define summary length parameters
            length_map = {
                "short": "a short summary (2-3 sentences)",
                "medium": "a concise summary (4-6 sentences)",
                "long": "a detailed summary (8-10 sentences)"
            }
            
            length_instruction = length_map.get(
                request.summary_length.lower(), 
                length_map["medium"]
            )
            
            # Prepare the prompt
            prompt = f"""
            Please provide {length_instruction} of the following text.
            Focus on the main ideas and key points.
            """
            
            if request.focus:
                prompt += f"\nFocus specifically on: {request.focus}"
                
            prompt += "\n\nText to summarize:\n" + request.text
            
            # Call the OpenAI API
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates concise, accurate summaries."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Extract the summary from the response
            summary = response.choices[0].message.content.strip()
            
            return SummaryResponse(
                summary=summary,
                original_length=len(request.text.split()),
                summary_length=len(summary.split()),
                reduction=1 - (len(summary.split()) / len(request.text.split()))
            )
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            raise AIServiceError(f"Failed to generate summary: {str(e)}")
    
    async def generate_flashcards(self, content: str, num_cards: int = 5) -> FlashcardDeck:
        """
        Generate flashcards from the provided content.
        
        Args:
            content: The content to generate flashcards from
            num_cards: Number of flashcards to generate (default: 5)
            
        Returns:
            FlashcardDeck containing the generated flashcards
        """
        try:
            # Prepare the prompt
            prompt = f"""
            Create {num_cards} high-quality flashcards based on the following content.
            Each flashcard should have a clear front (question/term) and back (answer/definition).
            Ensure the information is accurate and well-structured.
            
            Content:
            {content}
            
            Format your response as a JSON object with the following structure:
            {{
                "title": "Title for the flashcard deck",
                "description": "Brief description of the flashcard deck",
                "cards": [
                    {{
                        "front": "Question or term",
                        "back": "Answer or definition",
                        "tags": ["tag1", "tag2"],
                        "difficulty": "easy|medium|hard"
                    }}
                ]
            }}
            """
            
            # Call the OpenAI API
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates educational flashcards."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            try:
                response_text = response.choices[0].message.content.strip()
                response_json = json.loads(response_text)
                
                # Convert to Pydantic model for validation
                return FlashcardDeck(**response_json)
                
            except (json.JSONDecodeError, ValidationError) as e:
                logger.error(f"Error parsing flashcard response: {str(e)}")
                raise AIServiceError("Failed to parse flashcard generation response")
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            raise AIServiceError(f"Failed to generate flashcards: {str(e)}")

# Singleton instance
ai_service = AIService()
