import sys
import os
import uuid
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import MoviePy for video generation
from moviepy.editor import (
    TextClip, ColorClip, CompositeVideoClip, 
    concatenate_videoclips, AudioFileClip
)
from moviepy.config import change_settings

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create necessary directories
os.makedirs("videos", exist_ok=True)
os.makedirs("temp", exist_ok=True)

# Initialize FastAPI app
app = FastAPI(title="Test Video Generation API")

# Mount static files directory
app.mount("/videos", StaticFiles(directory="videos"), name="videos")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Video generation settings
VIDEO_SETTINGS = {
    "default": {
        "bg_color": "#ffffff",
        "text_color": "#000000",
        "font_size": 40,
        "font": "Arial",
    },
    "minimal": {
        "bg_color": "#f8f9fa",
        "text_color": "#212529",
        "font_size": 36,
        "font": "Helvetica",
    },
    "professional": {
        "bg_color": "#1a237e",
        "text_color": "#ffffff",
        "font_size": 42,
        "font": "Arial-Bold",
    },
    "educational": {
        "bg_color": "#e3f2fd",
        "text_color": "#0d47a1",
        "font_size": 38,
        "font": "Verdana",
    }
}

# Request model
class VideoRequest(BaseModel):
    text: str
    style: Optional[str] = "default"
    voice: Optional[str] = "default"
    duration_per_slide: Optional[int] = 5

# Response model
class VideoResponse(BaseModel):
    status: str
    message: str
    video_url: Optional[str] = None
    task_id: Optional[str] = None
    input: Optional[Dict[str, Any]] = None

# In-memory storage for tasks (in a real app, use a database)
tasks = {}

# Test endpoint
@app.get("/")
async def root():
    return {"message": "Test Video Generation API is running"}

def generate_video_clip(text: str, style: str, duration: int, output_path: str):
    """Generate a video clip with the given text and style."""
    try:
        # Get style settings
        style_settings = VIDEO_SETTINGS.get(style, VIDEO_SETTINGS["default"])
        
        # Create a text clip
        txt_clip = TextClip(
            text,
            fontsize=style_settings["font_size"],
            color=style_settings["text_color"],
            font=style_settings["font"],
            method="caption",
            size=(720, None),
            align="center"
        )
        
        # Set the duration of the text clip
        txt_clip = txt_clip.set_duration(duration)
        
        # Create a color clip for background
        color_clip = ColorClip(
            size=(1280, 720),
            color=[int(style_settings["bg_color"][i:i+2], 16) for i in (1, 3, 5)]
        ).set_duration(duration)
        
        # Center the text on the color background
        video = CompositeVideoClip(
            [color_clip, txt_clip.set_position("center")],
            size=(1280, 720)
        )
        
        # Write the video file
        video.write_videofile(
            output_path,
            fps=24,
            codec="libx264",
            audio_codec="aac",
            temp_audiofile="temp/temp-audio.m4a",
            remove_temp=True
        )
        
        return True
    except Exception as e:
        print(f"Error generating video: {str(e)}")
        return False

# Test video generation endpoint
@app.post("/test/video/generate", response_model=VideoResponse)
async def test_generate_video(
    request: VideoRequest, 
    background_tasks: BackgroundTasks
):
    try:
        # Generate a unique task ID
        task_id = str(uuid.uuid4())
        
        # Create output filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"video_{timestamp}_{task_id[:8]}.mp4"
        output_path = os.path.join("videos", output_filename)
        
        # Store task information
        tasks[task_id] = {
            "status": "processing",
            "progress": 0,
            "output_path": output_path,
            "start_time": datetime.now().isoformat()
        }
        
        # Generate video in the background
        background_tasks.add_task(
            process_video_generation,
            task_id=task_id,
            text=request.text,
            style=request.style,
            duration=request.duration_per_slide,
            output_path=output_path
        )
        
        return {
            "status": "processing",
            "message": "Video generation started",
            "task_id": task_id,
            "video_url": f"http://localhost:8000/videos/{output_filename}",
            "input": request.dict()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating video: {str(e)}"
        )

def process_video_generation(
    task_id: str, 
    text: str, 
    style: str, 
    duration: int, 
    output_path: str
):
    """Background task to process video generation."""
    try:
        # Update task status
        tasks[task_id]["status"] = "processing"
        tasks[task_id]["progress"] = 10
        
        # Generate the video
        success = generate_video_clip(text, style, duration, output_path)
        
        if success:
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["progress"] = 100
            tasks[task_id]["end_time"] = datetime.now().isoformat()
            tasks[task_id]["success"] = True
        else:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = "Failed to generate video"
            
    except Exception as e:
        if task_id in tasks:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = str(e)
        print(f"Error in background task: {str(e)}")

# Task status endpoint
@app.get("/test/video/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task_info = tasks[task_id].copy()
    
    # Don't expose internal paths
    if "output_path" in task_info:
        task_info["video_url"] = f"http://localhost:8000/{task_info['output_path']}"
        del task_info["output_path"]
    
    return task_info

# Video download endpoint
@app.get("/videos/{filename}")
async def download_video(filename: str):
    file_path = os.path.join("videos", filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_video_app:app", host="0.0.0.0", port=8000, reload=True)
