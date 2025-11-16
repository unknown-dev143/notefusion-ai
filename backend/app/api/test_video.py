from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uuid
from datetime import datetime
from pathlib import Path

router = APIRouter()

class TestVideoRequest(BaseModel):
    text: str
    style: str = "default"
    voice: str = "default"
    duration_per_slide: int = 5

@router.post("/test/video/generate")
async def test_video_generation(request: TestVideoRequest):
    """
    Test endpoint for video generation without Celery/Redis
    """
    try:
        # Create output directory if it doesn't exist
        output_dir = Path("test_videos")
        output_dir.mkdir(exist_ok=True)
        
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"test_video_{timestamp}.mp4"
        
        # Simple video generation using moviepy (synchronous for testing)
        from moviepy.editor import TextClip, ColorClip, CompositeVideoClip
        
        # Create a simple text clip
        text_clip = TextClip(
            request.text,
            fontsize=50,
            color='white',
            size=(800, 600),
            method='caption'
        ).set_duration(5)  # 5 seconds duration
        
        # Create a background
        background = ColorClip(
            size=(800, 600),
            color=(64, 64, 64)  # Dark gray
        ).set_duration(5)
        
        # Combine clips
        video = CompositeVideoClip([background, text_clip.set_position('center')])
        
        # Write to file
        video.write_videofile(
            str(output_path),
            fps=24,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp_audio.m4a',
            remove_temp=True
        )
        
        # Return the file path
        return {
            "status": "success",
            "video_path": str(output_path),
            "download_url": f"/test/video/download/{output_path.name}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating test video: {str(e)}"
        )

@router.get("/test/video/download/{filename}")
async def download_test_video(filename: str):
    """Download the generated test video"""
    file_path = Path("test_videos") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        media_type="video/mp4",
        filename=f"test_video_{filename}"
    )
