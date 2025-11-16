from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import os
from datetime import datetime
from typing import Optional

from ...services.video.ffmpeg_service import FFmpegVideoService

router = APIRouter(prefix="/test/video", tags=["test"])

@router.post("/generate")
async def test_generate_video(
    text: str,
    background_color: str = "navy",
    font_color: str = "white",
    font_size: int = 40,
    duration: int = 10
):
    """
    Test endpoint to generate a simple video with the given text.
    
    This is an unauthenticated endpoint for testing purposes only.
    """
    try:
        # Initialize the FFmpeg service
        video_service = FFmpegVideoService(output_dir="test_videos")
        
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"test_video_{timestamp}_{str(uuid.uuid4())[:8]}.mp4"
        
        # Generate the video
        video_path = video_service.generate_video(
            text=text,
            output_filename=output_filename,
            width=1280,
            height=720,
            duration=duration,
            background_color=background_color,
            font_color=font_color,
            font_size=font_size
        )
        
        if not video_path or not video_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate video"
            )
        
        # Return the video file
        return FileResponse(
            video_path,
            media_type="video/mp4",
            filename=os.path.basename(video_path)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating video: {str(e)}"
        )

@router.get("/list")
async def list_test_videos():
    """List all test videos."""
    video_dir = Path("test_videos")
    if not video_dir.exists():
        return {"videos": []}
        
    videos = []
    for file in video_dir.glob("*.mp4"):
        videos.append({
            "filename": file.name,
            "path": str(file),
            "size": file.stat().st_size,
            "created": file.stat().st_ctime
        })
    
    return {"videos": videos}
