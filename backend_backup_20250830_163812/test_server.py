from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List, Tuple, Union
import os
import sys
import uuid
import logging
import numpy as np
import imageio.v2 as imageio
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
from datetime import datetime
from pathlib import Path
import base64
import time
import random
import json
from enum import Enum
from dataclasses import dataclass

# Enums for options
class TransitionType(str, Enum):
    FADE = "fade"
    SLIDE_LEFT = "slide_left"
    SLIDE_RIGHT = "slide_right"
    ZOOM = "zoom"
    NONE = "none"

class TextPosition(str, Enum):
    CENTER = "center"
    TOP = "top"
    BOTTOM = "bottom"
    LEFT = "left"
    RIGHT = "right"

class BackgroundType(str, Enum):
    COLOR = "color"
    GRADIENT = "gradient"
    IMAGE = "image"
    BLUR = "blur"

# Data Models
class SlideContent(BaseModel):
    text: str
    duration: float = Field(5.0, ge=1.0, le=60.0, description="Duration in seconds")
    text_color: str = "#FFFFFF"
    background: str = "#1E1E1E"
    background_type: BackgroundType = BackgroundType.COLOR
    text_position: TextPosition = TextPosition.CENTER
    font_size: int = Field(36, ge=12, le=144)
    font_family: str = "Arial"
    transition: TransitionType = TransitionType.FADE
    transition_duration: float = Field(0.5, ge=0.1, le=2.0)

class AudioSettings(BaseModel):
    enabled: bool = False
    background_music: Optional[str] = None
    volume: float = Field(0.5, ge=0.0, le=1.0)
    voice_over: bool = False
    voice_speed: float = Field(1.0, ge=0.5, le=2.0)

class VideoRequest(BaseModel):
    slides: List[SlideContent]
    audio: AudioSettings = AudioSettings()
    resolution: Tuple[int, int] = (1280, 720)
    fps: int = Field(30, ge=15, le=60)
    output_format: str = "mp4"
    watermark: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the Python path
sys.path.append(str(Path(__file__).parent))

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a directory to store generated videos
VIDEO_DIR = Path("test_videos")
VIDEO_DIR.mkdir(exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory=str(VIDEO_DIR)), name="static")

class TestVideoRequest(BaseModel):
    text: str
    style: str = "default"
    voice: str = "default"
    duration_per_slide: int = 5

@app.get("/", response_class=HTMLResponse)
async def get_test_page():
    """Serve the test page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Video Generation Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { display: flex; flex-direction: column; gap: 20px; }
            textarea { width: 100%; height: 150px; padding: 10px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
            button:disabled { background: #cccccc; }
            #videoContainer { margin-top: 20px; }
            #status { margin-top: 10px; padding: 10px; border-radius: 4px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Video Generation Test</h1>
            <div>
                <label for="textInput">Enter text for video:</label>
                <textarea id="textInput" placeholder="Enter your text here..."></textarea>
            </div>
            <div>
                <label for="durationInput">Duration (seconds):</label>
                <input type="number" id="durationInput" value="5" min="1" max="60">
            </div>
            <button id="generateBtn">Generate Video</button>
            <div id="status"></div>
            <div id="videoContainer"></div>
        </div>

        <script>
            document.getElementById('generateBtn').addEventListener('click', async () => {
                const text = document.getElementById('textInput').value.trim();
                const duration = document.getElementById('durationInput').value;
                const statusEl = document.getElementById('status');
                const videoContainer = document.getElementById('videoContainer');
                
                if (!text) {
                    statusEl.textContent = 'Please enter some text';
                    statusEl.className = 'error';
                    return;
                }
                
                statusEl.textContent = 'Generating video...';
                statusEl.className = '';
                
                try {
                    const response = await fetch('/test/video/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            style: 'default',
                            voice: 'default',
                            duration_per_slide: parseInt(duration)
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        statusEl.textContent = 'Video generated successfully!';
                        statusEl.className = 'success';
                        
                        // Display the video
                        videoContainer.innerHTML = `
                            <h3>Generated Video:</h3>
                            <video width="800" height="450" controls>
                                <source src="${result.download_url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <p><a href="${result.download_url}" download>Download Video</a></p>
                        `;
                    } else {
                        throw new Error(result.detail || 'Failed to generate video');
                    }
                } catch (error) {
                    statusEl.textContent = `Error: ${error.message}`;
                    statusEl.className = 'error';
                    console.error('Error:', error);
                }
            });
        </script>
    </body>
    </html>
    """

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient(width: int, height: int, colors: List[str]) -> Image.Image:
    """Create a gradient background"""
    if len(colors) == 1:
        return Image.new('RGB', (width, height), color=hex_to_rgb(colors[0]))
    
    base = Image.new('RGB', (width, height), color=hex_to_rgb(colors[0]))
    top = Image.new('RGB', (width, height), color=hex_to_rgb(colors[-1]))
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def apply_blur(image: Image.Image, radius: int = 10) -> Image.Image:
    """Apply blur effect to an image"""
    return image.filter(ImageFilter.GaussianBlur(radius=radius))

def create_slide_frame(slide: SlideContent, width: int, height: int) -> Image.Image:
    """Create a slide frame with styled content"""
    # Create background
    if slide.background_type == BackgroundType.GRADIENT:
        colors = [c.strip() for c in slide.background.split(',')]
        if not colors:
            colors = ['#1E1E1E', '#3A3A3A']
        img = create_gradient(width, height, colors)
    elif slide.background_type == BackgroundType.IMAGE and os.path.exists(slide.background):
        img = Image.open(slide.background).convert('RGB')
        img = img.resize((width, height), Image.LANCZOS)
        if slide.background_type == BackgroundType.BLUR:
            img = apply_blur(img)
    else:  # Default to solid color
        bg_color = hex_to_rgb(slide.background)
        img = Image.new('RGB', (width, height), color=bg_color)
    
    draw = ImageDraw.Draw(img)
    
    # Load font with error handling
    try:
        font = ImageFont.truetype(f"{slide.font_family}.ttf", slide.font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", slide.font_size)
        except:
            font = ImageFont.load_default()
    
    # Split text into lines
    lines = []
    for line in slide.text.split('\n'):
        words = line.split()
        current_line = []
        current_width = 0
        
        for word in words:
            word_width = draw.textlength(' '.join(current_line + [word]), font=font)
            if word_width < width * 0.9:  # 90% of width
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
    
    # Calculate text position
    text_height = sum(font.getbbox(line)[3] - font.getbbox(line)[1] for line in lines) + (len(lines) - 1) * 10
    y = (height - text_height) // 2  # Start Y position
    
    # Draw each line of text
    text_color = hex_to_rgb(slide.text_color)
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        
        # Calculate X position based on alignment
        if slide.text_position == TextPosition.LEFT:
            x = width * 0.1  # 10% from left
        elif slide.text_position == TextPosition.RIGHT:
            x = width - text_width - (width * 0.1)  # 10% from right
        else:  # CENTER, TOP, BOTTOM
            x = (width - text_width) // 2
        
        # Adjust Y position for TOP/BOTTOM
        if slide.text_position == TextPosition.TOP:
            y = height * 0.1  # 10% from top
        elif slide.text_position == TextPosition.BOTTOM:
            y = height - text_height - (height * 0.1)  # 10% from bottom
        
        # Draw text with shadow for better visibility
        shadow_color = (0, 0, 0, 150)
        for adj in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
            draw.text((x + adj[0]*2, y + adj[1]*2), line, font=font, fill=shadow_color)
        
        # Draw main text
        draw.text((x, y), line, font=font, fill=text_color)
        
        # Move Y position for next line
        y += (bbox[3] - bbox[1]) + 10
    
    return img

def apply_transition(frame1: np.ndarray, frame2: np.ndarray, progress: float, transition: TransitionType, width: int, height: int) -> np.ndarray:
    """Apply transition effect between two frames"""
    if transition == TransitionType.NONE or progress >= 1.0:
        return frame2
    
    if progress <= 0.0:
        return frame1
    
    frame1 = frame1.astype(float)
    frame2 = frame2.astype(float)
    
    if transition == TransitionType.FADE:
        # Cross-fade between frames
        return (frame1 * (1 - progress) + frame2 * progress).astype(np.uint8)
        
    elif transition == TransitionType.SLIDE_LEFT:
        # Slide left transition
        x_offset = int(width * progress)
        result = frame2.copy()
        result[:, :width - x_offset] = frame1[:, x_offset:]
        return result.astype(np.uint8)
        
    elif transition == TransitionType.SLIDE_RIGHT:
        # Slide right transition
        x_offset = int(width * progress)
        result = frame2.copy()
        result[:, x_offset:] = frame1[:, :width - x_offset]
        return result.astype(np.uint8)
        
    elif transition == TransitionType.ZOOM:
        # Zoom transition
        scale = 1.0 + progress * 0.3  # Zoom in 30%
        h, w = frame1.shape[:2]
        center_x, center_y = w // 2, h // 2
        
        # Create grid of coordinates
        y, x = np.ogrid[:h, :w]
        
        # Calculate distance from center
        y_norm = (y - center_y) / h * 2
        x_norm = (x - center_x) / w * 2
        
        # Apply zoom effect
        y_zoom = (y_norm / scale + 1) * h / 2
        x_zoom = (x_norm / scale + 1) * w / 2
        
        # Create output frame
        result = np.zeros_like(frame1, dtype=float)
        
        # Sample from frame1 with zoom effect
        for c in range(3):
            result[..., c] = np.interp(
                y_zoom.flatten(),
                np.arange(h),
                frame1[..., c],
                left=0,
                right=0
            ).reshape((h, w))
            
        # Fade to frame2
        return (result * (1 - progress) + frame2 * progress).astype(np.uint8)
    
    return frame2.astype(np.uint8)

def generate_video_from_slides(slides: List[SlideContent], output_path: Path, width: int = 1280, height: int = 720, fps: int = 30) -> Path:
    """Generate a video from multiple slides with transitions"""
    try:
        logger.info(f"Generating video with {len(slides)} slides at {output_path}")
        
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create temporary directory for frames
        temp_dir = Path("temp_frames")
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # Generate all slide frames
            slide_frames = []
            for i, slide in enumerate(slides):
                logger.info(f"Processing slide {i+1}/{len(slides)}: {slide.text[:30]}...")
                
                # Create base frame for this slide
                base_frame = create_slide_frame(slide, width, height)
                
                # Calculate number of frames for this slide
                num_frames = max(1, int(slide.duration * fps))
                
                # Generate frames with fade in/out
                for j in range(num_frames):
                    progress = j / max(1, (num_frames - 1))
                    
                    # Apply fade in/out effect
                    fade = 0.2 + 0.8 * (1 - abs(2 * progress - 1))
                    
                    # Apply fade to frame
                    frame = np.array(base_frame, dtype=float) * fade
                    slide_frames.append({
                        'frame': frame.astype(np.uint8),
                        'slide_idx': i,
                        'progress': progress
                    })
            
            # Add transition frames between slides
            final_frames = []
            for i in range(len(slide_frames)):
                current = slide_frames[i]
                
                # Check if this is the last frame of a slide
                if i < len(slide_frames) - 1 and slide_frames[i+1]['slide_idx'] > current['slide_idx']:
                    next_slide = slide_frames[i+1]
                    transition = slides[current['slide_idx']].transition
                    transition_frames = int(fps * slides[current['slide_idx']].transition_duration)
                    
                    # Generate transition frames
                    for t in range(transition_frames):
                        progress = t / max(1, (transition_frames - 1))
                        transition_frame = apply_transition(
                            current['frame'],
                            next_slide['frame'],
                            progress,
                            transition,
                            width,
                            height
                        )
                        final_frames.append(transition_frame)
                
                # Add the current frame if it's not part of a transition
                if i == 0 or slide_frames[i-1]['slide_idx'] == current['slide_idx']:
                    final_frames.append(current['frame'])
            
            # Save the final video
            logger.info(f"Saving video with {len(final_frames)} frames to {output_path}")
            
            with imageio.get_writer(
                str(output_path),
                fps=fps,
                codec='libx264',
                quality=9,
                pixelformat='yuv420p',
                ffmpeg_log_level='info',
                macro_block_size=16
            ) as writer:
                for frame in final_frames:
                    writer.append_data(frame)
            
            logger.info(f"Video saved successfully: {output_path} (size: {output_path.stat().st_size / (1024*1024):.2f} MB)")
            return output_path
            
        finally:
            # Clean up temporary files
            for file in temp_dir.glob("*"):
                try:
                    file.unlink()
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file {file}: {e}")
            try:
                temp_dir.rmdir()
            except Exception as e:
                logger.warning(f"Failed to remove temporary directory: {e}")
                
    except Exception as e:
        logger.error(f"Error in generate_video_from_slides: {str(e)}", exc_info=True)
        if output_path.exists():
            try:
                output_path.unlink()
            except Exception as del_err:
                logger.error(f"Failed to delete partial video: {del_err}")
        raise

@app.post("/api/v1/video/generate")
async def generate_video_endpoint(request: VideoRequest):
    """
    Generate a video with multiple slides and customizations
    """
    try:
        logger.info(f"Received video generation request with {len(request.slides)} slides")
        
        # Validate input
        if not request.slides:
            raise HTTPException(status_code=400, detail="At least one slide is required")
        
        for i, slide in enumerate(request.slides):
            if not slide.text.strip():
                raise HTTPException(status_code=400, detail=f"Slide {i+1}: Text cannot be empty")
            
            if slide.duration < 1 or slide.duration > 60:
                raise HTTPException(
                    status_code=400,
                    detail=f"Slide {i+1}: Duration must be between 1 and 60 seconds"
                )
        
        # Generate a unique filename
        timestamp = int(time.time())
        filename = f"video_{timestamp}.mp4"
        video_path = VIDEO_DIR / filename
        
        # Ensure the static directory exists
        VIDEO_DIR.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Creating video at: {video_path}")
        
        try:
            # Generate the video with all slides and transitions
            generate_video_from_slides(
                slides=request.slides,
                output_path=video_path,
                width=request.resolution[0],
                height=request.resolution[1],
                fps=request.fps
            )
            
        except Exception as e:
            logger.error(f"Video generation failed: {str(e)}", exc_info=True)
            error_detail = str(e)
            if "codec" in error_detail.lower():
                error_detail += " (Try installing FFmpeg for better codec support)"
            raise HTTPException(
                status_code=500,
                detail=f"Video generation failed: {error_detail}"
            )
        
        # Verify the video was created
        if not video_path.exists():
            logger.error(f"Video file was not created: {video_path}")
            raise HTTPException(status_code=500, detail="Video file was not created")
            
        file_size = video_path.stat().st_size
        if file_size == 0:
            logger.error(f"Video file is empty: {video_path}")
            video_path.unlink()  # Clean up empty file
            raise HTTPException(status_code=500, detail="Generated video is empty")
        
        logger.info(f"Successfully generated video at {video_path} (size: {file_size / (1024*1024):.2f} MB)")
        
        # Return relative URL for the static file
        download_url = f"/static/{filename}"
        
        return {
            "status": "success",
            "video_path": str(video_path),
            "download_url": download_url,
            "message": "Video generated successfully",
            "metadata": {
                "duration": sum(slide.duration for slide in request.slides),
                "resolution": f"{request.resolution[0]}x{request.resolution[1]}",
                "fps": request.fps,
                "file_size": file_size,
                "file_size_mb": file_size / (1024 * 1024),
                "created_at": datetime.now().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/test/video/download/{filename}")
async def download_test_video(filename: str):
    """Download the generated test video"""
    file_path = Path("test_videos") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        media_type="video/mp4",
        filename=filename
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_server:app", host="0.0.0.0", port=8000, reload=True)
