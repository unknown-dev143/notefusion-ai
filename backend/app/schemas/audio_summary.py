"""
Pydantic models for audio note summarization.
"""
from typing import Optional, List
from pydantic import BaseModel, Field

class AudioSummaryRequest(BaseModel):
    """Request model for generating an audio note summary."""
    note_id: int = Field(..., description="ID of the audio note to summarize")
    style: str = Field("concise", description="Summary style (concise, detailed, bullet_points)")
    max_length: int = Field(250, description="Maximum length of the summary in words")

class AudioSummaryResponse(BaseModel):
    """Response model for audio note summary."""
    summary: str = Field(..., description="Generated summary of the audio note")
    key_points: List[str] = Field(..., description="List of key points extracted from the audio")
    tags: List[str] = Field(default_factory=list, description="Suggested tags for the audio note")
    summary_style: str = Field(..., description="Style of the generated summary")
