from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class VideoStyle(str, Enum):
    PROFESSIONAL = "professional"
    EDUCATIONAL = "educational"
    CASUAL = "casual"
    MINIMALIST = "minimalist"

class VideoVoice(str, Enum):
    MALE = "male"
    FEMALE = "female"
    NEUTRAL = "neutral"

class VideoGenerationRequest(BaseModel):
    """Request model for video generation."""
    title: str = Field(..., description="Title of the video", min_length=5, max_length=100)
    description: Optional[str] = Field(None, description="Description of the video", max_length=500)
    script: str = Field(..., description="The main content/script for the video")
    style: VideoStyle = Field(
        default=VideoStyle.PROFESSIONAL,
        description="Visual style of the video"
    )
    voice: VideoVoice = Field(
        default=VideoVoice.NEUTRAL,
        description="Voice type for narration"
    )
    duration_per_slide: int = Field(
        default=5,
        ge=3,
        le=60,
        description="Duration in seconds to display each slide"
    )
    include_captions: bool = Field(
        default=True,
        description="Whether to include captions in the video"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata for the video generation"
    )

class VideoGenerationResponse(BaseModel):
    """Response model for video generation."""
    task_id: str = Field(..., description="Unique identifier for the video generation task")
    status: str = Field(..., description="Current status of the task")
    message: str = Field(..., description="Human-readable message about the task status")
    created_at: str = Field(..., description="Timestamp when the task was created")
    
    class Config:
        schema_extra = {
            "example": {
                "task_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "pending",
                "message": "Video generation task has been queued",
                "created_at": "2025-08-08T17:45:00.000000"
            }
        }

class VideoStatusResponse(VideoGenerationResponse):
    """Response model for video status check."""
    progress: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Progress percentage of the video generation"
    )
    video_url: Optional[str] = Field(
        None,
        description="URL to download the generated video (available when status is 'completed')"
    )
    error: Optional[str] = Field(
        None,
        description="Error message if the task failed"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "task_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "processing",
                "message": "Video generation is in progress",
                "created_at": "2025-08-08T17:45:00.000000",
                "progress": 42.5,
                "video_url": None,
                "error": None
            }
        }
