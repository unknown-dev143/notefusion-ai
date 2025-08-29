"""
Audio Note Model
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from pydantic import validator

class AudioNoteBase(BaseModel):
    """Base model for audio notes."""
    title: str
    file_path: str
    duration: Optional[float] = None
    transcription: Optional[str] = None
    user_id: Optional[int] = None
    tags: list[str] = []

class AudioNoteCreate(AudioNoteBase):
    """Model for creating a new audio note."""
    pass

class AudioNoteUpdate(BaseModel):
    """Model for updating an existing audio note."""
    title: Optional[str] = None
    transcription: Optional[str] = None
    tags: Optional[list[str]] = None

class AudioNoteInDB(AudioNoteBase):
    """Database model for audio notes."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AudioNoteResponse(AudioNoteInDB):
    """Response model for audio notes."""
    audio_url: Optional[str] = None

class AudioNoteListResponse(BaseModel):
    """Response model for paginated list of audio notes."""
    items: list[AudioNoteResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class AudioNoteQueryParams(BaseModel):
    """Query parameters for filtering and paginating audio notes."""
    page: int = 1
    page_size: int = 10
    search: Optional[str] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    
    @validator('page')
    def validate_page(cls, v):
        if v < 1:
            return 1
        return v
    
    @validator('page_size')
    def validate_page_size(cls, v):
        if v < 1:
            return 10
        if v > 100:
            return 100
        return v
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v.lower() not in ['asc', 'desc']:
            return 'desc'
        return v.lower()
