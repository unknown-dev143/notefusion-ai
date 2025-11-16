"""
Service for generating summaries from audio notes.
"""
from typing import List, Dict, Any
import logging
from datetime import datetime

from app import crud, models
from app.schemas.audio_summary import AudioSummaryRequest, AudioSummaryResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

class AudioSummarizer:
    """Service for generating summaries from audio notes."""
    
    def __init__(self):
        self.summary_styles = {
            "concise": self._generate_concise_summary,
            "detailed": self._generate_detailed_summary,
            "bullet_points": self._generate_bullet_points
        }
    
    async def generate_summary(
        self,
        db,
        request: AudioSummaryRequest,
        current_user: models.User
    ) -> AudioSummaryResponse:
        """Generate a summary for an audio note."""
        # Get the audio note
        note = crud.audio_note.get(db, note_id=request.note_id)
        if not note:
            raise ValueError("Audio note not found")
        
        # Check permissions
        if note.user_id != current_user.id and not current_user.is_superuser:
            raise PermissionError("Not authorized to access this note")
        
        # Generate summary based on style
        summary_func = self.summary_styles.get(
            request.style,
            self.summary_styles["concise"]  # Default to concise
        )
        
        # Generate the summary
        summary = await summary_func(note, request.max_length)
        
        # Extract key points and tags
        key_points = self._extract_key_points(note)
        tags = self._extract_tags(note, summary, key_points)
        
        return AudioSummaryResponse(
            summary=summary,
            key_points=key_points,
            tags=tags,
            summary_style=request.style
        )
    
    async def _generate_concise_summary(self, note, max_length: int = 250) -> str:
        """Generate a concise summary of the audio note."""
        # This is a placeholder - in a real implementation, you would use an LLM
        # to generate the summary from the transcription
        if not note.transcription:
            return "No transcription available for this audio note."
            
        words = note.transcription.split()
        if len(words) <= max_length:
            return note.transcription
            
        return " ".join(words[:max_length]) + "..."
    
    async def _generate_detailed_summary(self, note, max_length: int = 500) -> str:
        """Generate a detailed summary of the audio note."""
        if not note.transcription:
            return "No transcription available for this audio note."
            
        # In a real implementation, this would use an LLM to generate a more
        # detailed and coherent summary
        return await self._generate_concise_summary(note, max_length)
    
    async def _generate_bullet_points(self, note, max_points: int = 5) -> str:
        """Generate bullet points from the audio note."""
        if not note.transcription:
            return "• No transcription available for this audio note."
            
        # In a real implementation, this would use an LLM to extract key points
        # For now, we'll just split the transcription into sentences
        import re
        sentences = re.split(r'(?<=[.!?]) +', note.transcription)
        bullet_points = [f"• {s.strip()}" for s in sentences[:max_points]]
        return "\n".join(bullet_points)
    
    def _extract_key_points(self, note) -> List[str]:
        """Extract key points from the audio note."""
        if not note.transcription:
            return ["No transcription available"]
            
        # In a real implementation, this would use NLP to extract key points
        # For now, we'll just return the first few sentences
        import re
        sentences = re.split(r'(?<=[.!?]) +', note.transcription)
        return [s.strip() for s in sentences[:3]]
    
    def _extract_tags(self, note, summary: str, key_points: List[str]) -> List[str]:
        """Extract relevant tags from the note content."""
        # In a real implementation, this would use NLP to extract relevant tags
        # For now, we'll return a simple set of tags based on the title and content
        tags = set()
        
        # Add any existing tags
        if hasattr(note, 'tags') and note.tags:
            tags.update(tag.lower() for tag in note.tags)
        
        # Add some basic tags based on content length
        content = f"{note.title} {note.transcription or ''} {summary}"
        if len(content) < 100:
            tags.add("short")
        elif len(content) > 1000:
            tags.add("long")
            
        # Add a language tag if available
        if hasattr(note, 'language') and note.language:
            tags.add(f"lang:{note.language}")
            
        return list(tags)[:5]  # Return up to 5 tags

# Create a singleton instance
audio_summarizer = AudioSummarizer()
