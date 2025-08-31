"""Tests for the video generation service."""
import pytest
from unittest.mock import MagicMock, AsyncMock
from pathlib import Path

from app.schemas.video import VideoGenerationRequest, VideoStyle, VideoVoice
from app.models.task import TaskStatus, TaskType
from app.services.video.service import VideoGenerationService
from app.services.video.config import VideoSettings

# Test data
TEST_SCRIPT = """# Test Presentation

## Introduction
This is a test presentation."""

@pytest.fixture
def video_service():
    """Create a VideoGenerationService instance for testing."""
    service = VideoGenerationService(db=MagicMock())
    service.config = VideoSettings(output_dir=Path("test_output"))
    service.ffmpeg_service = MagicMock()
    service.ffmpeg_service.generate_video.return_value = "test_video.mp4"
    return service

@pytest.fixture
def sample_request():
    """Create a sample video generation request."""
    return VideoGenerationRequest(
        title="Test Video",
        script=TEST_SCRIPT,
        style=VideoStyle.PROFESSIONAL,
        voice=VideoVoice.NEUTRAL,
        duration_per_slide=5
    )

@pytest.mark.asyncio
async def test_generate_video_success(video_service, sample_request):
    """Test successful video generation."""
    result = await video_service.generate_video(sample_request, "test-user")
    assert "task_id" in result
    assert result["status"] == TaskStatus.PENDING

@pytest.mark.asyncio
async def test_process_video_generation(video_service, sample_request):
    """Test the video generation process."""
    video_service._generate_slides = MagicMock(return_value=[{"type": "title", "content": "Test"}])
    result = await video_service._process_video_generation("task-123", sample_request.dict(), "user-123")
    assert "output_path" in result
    assert result["status"] == TaskStatus.COMPLETED

def test_generate_slides(video_service):
    """Test slide generation."""
    slides = video_service._generate_slides("# Title\nContent", VideoStyle.PROFESSIONAL, 5)
    assert len(slides) > 0
    assert slides[0]["type"] == "title"
