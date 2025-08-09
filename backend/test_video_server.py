from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uuid
from pathlib import Path

# Create FastAPI app
app = FastAPI(title="Test Video Generation API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("test_videos", exist_ok=True)

# Mount static files
app.mount("/test_videos", StaticFiles(directory="test_videos"), name="test_videos")

class VideoRequest(BaseModel):
    text: str
    style: Optional[str] = "default"
    voice: Optional[str] = "default"
    duration_per_slide: Optional[int] = 5

# In-memory storage for tasks
tasks = {}

@app.get("/")
async def root():
    return {"message": "Test Video Generation API is running"}

@app.post("/test/video/generate")
async def generate_video(request: VideoRequest, background_tasks: BackgroundTasks):
    try:
        # Generate a unique task ID
        task_id = str(uuid.uuid4())
        
        # Store task information
        output_file = f"test_videos/{task_id}.mp4"
        tasks[task_id] = {
            "status": "processing",
            "progress": 0,
            "output_file": output_file,
            "error": None
        }
        
        # Start the background task
        background_tasks.add_task(
            process_video_task,
            task_id=task_id,
            text=request.text,
            style=request.style,
            output_file=output_file,
            duration=request.duration_per_slide
        )
        
        return {
            "status": "started",
            "task_id": task_id,
            "message": "Video generation started",
            "check_status_url": f"/test/video/status/{task_id}",
            "download_url": f"/test/video/download/{task_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def process_video_task(task_id: str, text: str, style: str, output_file: str, duration: int):
    try:
        # Update task status
        tasks[task_id]["status"] = "processing"
        tasks[task_id]["progress"] = 10
        
        # Import moviepy here to catch any import errors
        try:
            from moviepy.editor import TextClip, ColorClip, CompositeVideoClip
        except ImportError as e:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = f"Failed to import moviepy: {str(e)}"
            return
        
        # Create a simple video
        try:
            # Create a text clip
            txt_clip = TextClip(
                text,
                fontsize=40,
                color='white',
                size=(640, 480),
                method='caption'
            )
            
            # Set duration
            txt_clip = txt_clip.set_duration(duration)
            
            # Create a background
            color_clip = ColorClip(
                size=(640, 480),
                color=(64, 64, 255)  # Blue background
            )
            color_clip = color_clip.set_duration(duration)
            
            # Combine the clips
            video = CompositeVideoClip([color_clip, txt_clip.set_position('center')])
            
            # Update progress
            tasks[task_id]["progress"] = 50
            
            # Write the video file
            video.write_videofile(
                output_file,
                fps=24,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp_audio.m4a',
                remove_temp=True
            )
            
            # Update task status
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["progress"] = 100
            
        except Exception as e:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = str(e)
            
    except Exception as e:
        if task_id in tasks:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = str(e)

@app.get("/test/video/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "task_id": task_id,
        **tasks[task_id]
    }

@app.get("/test/video/download/{task_id}")
async def download_video(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready yet")
    
    output_file = task["output_file"]
    
    if not os.path.exists(output_file):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return {"video_url": f"/test_videos/{os.path.basename(output_file)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
