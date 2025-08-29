"""
Pydantic models for audio notes API.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator

class AudioNoteBase(BaseModel):
    """Base model for audio notes."""
    title: str = Field(..., description="Title of the audio note")
    file_path: str = Field(..., description="Path to the audio file")
    file_size: Optional[int] = Field(None, description="Size of the audio file in bytes")
    duration: Optional[float] = Field(None, description="Duration of the audio in seconds")
    transcription: Optional[str] = Field(None, description="Transcription of the audio")
    language: str = Field("en", description="Language code of the audio")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")

class AudioNoteCreate(AudioNoteBase):
    """Model for creating a new audio note."""
    pass

class AudioNoteUpdate(BaseModel):
    """Model for updating an audio note."""
    title: Optional[str] = Field(None, description="Updated title")
    transcription: Optional[str] = Field(None, description="Updated transcription")
    tags: Optional[List[str]] = Field(None, description="Updated tags")
    language: Optional[str] = Field(None, description="Updated language code")

class AudioNoteInDBBase(AudioNoteBase):
    """Base model for audio notes in the database."""
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AudioNote(AudioNoteInDBBase):
    """Model for audio note responses."""
    audio_url: Optional[str] = Field(None, description="URL to access the audio file")

class AudioNoteInDB(AudioNoteInDBBase):
    """Model for audio notes in the database."""
    pass

class PaginatedResponse(BaseModel):
    """Base model for paginated responses."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

class AudioNoteListResponse(PaginatedResponse):
    """Response model for paginated list of audio notes."""
    items: List[AudioNote]

class AudioNoteQueryParams(BaseModel):
    """Query parameters for filtering and paginating audio notes."""
    page: int = Field(1, ge=1, description="Page number (1-based)")
    page_size: int = Field(10, ge=1, le=100, description="Number of items per page")
    search: Optional[str] = Field(None, description="Search term to filter notes")
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: str = Field("desc", description="Sort order (asc or desc)")
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v.lower() not in ['asc', 'desc']:
            raise ValueError("sort_order must be 'asc' or 'desc'")
        return v.lower()

class AudioNoteStats(BaseModel):
    """Statistics about audio notes."""
    total_notes: int
    total_duration: float
    total_size: int
    last_created: Optional[str]

class AudioUploadResponse(BaseModel):
    """Response model for file uploads."""
    id: int
    title: str
    file_path: str
    audio_url: str
    duration: Optional[float]
    file_size: int
