import os
import uuid
import logging
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path

from sqlalchemy.orm import Session

from ...schemas.video import VideoGenerationRequest, VideoStyle, VideoVoice
from ...models.task import Task, TaskStatus, TaskType
from ...crud.task import create_task, update_task_status, get_task
from ...core.config import settings

# Import the FFmpeg video service
from .ffmpeg_service import FFmpegVideoService

# Configure logging
logger = logging.getLogger(__name__)

class VideoGenerationService:
    """Service for generating videos from text content."""
    
    def __init__(self, db: Session):
        self.db = db
        self.output_dir = Path(settings.VIDEO_OUTPUT_DIR) if hasattr(settings, 'VIDEO_OUTPUT_DIR') else Path("data/videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize FFmpeg service
        self.ffmpeg_service = FFmpegVideoService(output_dir=str(self.output_dir))
    
    async def generate_video(self, request: VideoGenerationRequest, user_id: str) -> Dict[str, Any]:
        """
        Start a video generation task.
        
        Args:
            request: Video generation request details
            user_id: ID of the user making the request
            
        Returns:
            Dictionary containing task information
        """
        try:
            # Create a unique task ID
            task_id = str(uuid.uuid4())
            
            # Create task record in the database
            task = create_task(
                db=self.db,
                task_id=task_id,
                user_id=user_id,
                task_type=TaskType.VIDEO_GENERATION,
                status=TaskStatus.PENDING,
                input_data={
                    "title": request.title,
                    "description": request.description,
                    "style": request.style,
                    "voice": request.voice,
                    "duration_per_slide": request.duration_per_slide,
                    "include_captions": request.include_captions,
                    "metadata": request.metadata or {}
                }
            )
            
            # In a real implementation, you would start a background task here
            # For now, we'll just update the task status
            self._process_video_generation(task_id, request, user_id)
            
            return {
                "task_id": task_id,
                "status": TaskStatus.PENDING,
                "message": "Video generation task has been queued",
                "created_at": task.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating video generation task: {str(e)}")
            raise
    
    def _process_video_generation(self, task_id: str, request: VideoGenerationRequest, user_id: str):
        """
        Process video generation in the background.
        
        In a production environment, this would be run in a separate process/worker.
        """
        try:
            # Update task status to processing
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 0}
            )
            
            # Generate a unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"video_{timestamp}_{task_id[:8]}.mp4"
            
            # Map style to FFmpeg parameters
            style_config = self._get_style_config(request.style)
            
            # Update progress
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 25}
            )
            
            # Generate the video using FFmpeg
            video_path = self.ffmpeg_service.generate_video(
                text=request.content,
                output_filename=output_filename,
                width=style_config["width"],
                height=style_config["height"],
                duration=request.duration_seconds or 10,  # Default to 10 seconds if not specified
                background_color=style_config["background_color"],
                font_color=style_config["font_color"],
                font_size=style_config["font_size"]
            )
            
            if not video_path or not video_path.exists():
                raise Exception("Failed to generate video file")
            
            # Update progress
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 90}
            )
            
            # Prepare result data
            result_data = {
                "progress": 100,
                "video_path": str(video_path.relative_to(self.output_dir)),
                "file_size": video_path.stat().st_size,
                "duration": request.duration_seconds or 10,
                "video_url": f"/api/videos/download/{task_id}"
            }
            
            # Update task with final result
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.COMPLETED,
                result=result_data,
                result_data=result_data
            )
            
        except subprocess.CalledProcessError as e:
            error_msg = f"FFmpeg command failed with return code {e.returncode}"
            if e.stderr:
                error_msg += f"\nError: {e.stderr.decode('utf-8')}"
            logger.error(error_msg)
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=error_msg
            )
            
        except Exception as e:
            error_msg = f"Error generating video: {str(e)}"
            logger.error(error_msg, exc_info=True)
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=error_msg
            )
    
    def _get_style_config(self, style: VideoStyle) -> Dict[str, Any]:
        """Get FFmpeg parameters based on video style."""
        styles = {
            VideoStyle.DEFAULT: {
                "width": 1280,
                "height": 720,
                "background_color": "navy",
                "font_color": "white",
                "font_size": 40
            },
            VideoStyle.PRESENTATION: {
                "width": 1280,
                "height": 720,
                "background_color": "#1a237e",  # Dark blue
                "font_color": "white",
                "font_size": 42
            },
            VideoStyle.TUTORIAL: {
                "width": 1280,
                "height": 720,
                "background_color": "#0d47a1",  # Blue
                "font_color": "white",
                "font_size": 38
            },
            VideoStyle.EXPLAINER: {
                "width": 1080,
                "height": 1920,  # Vertical for mobile
                "background_color": "#1e88e5",  # Light blue
                "font_color": "white",
                "font_size": 44
            },
            VideoStyle.PODCAST: {
                "width": 1920,
                "height": 1080,
                "background_color": "black",
                "font_color": "white",
                "font_size": 48
            }
        }
        
        return styles.get(style, styles[VideoStyle.DEFAULT])
    
    def get_video_status(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get the status of a video generation task.
        
        Args:
            task_id: ID of the task to check
            user_id: ID of the user making the request
            
        Returns:
            Dictionary containing task status and details
        """
        task = get_task(self.db, task_id=task_id, user_id=user_id)
        if not task:
            return None
        
        response = {
            "task_id": task.task_id,
            "status": task.status,
            "message": f"Video generation is {task.status}",
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "error": task.error_message
        }
        
        # Add additional data from result_data if available
        if task.result_data:
            response.update(task.result_data)
            
        return response
    
    def get_video_file(self, task_id: str, user_id: str) -> Optional[Path]:
        """
        Get the path to a generated video file.
        
        Args:
            task_id: ID of the task
            user_id: ID of the user making the request
            
        Returns:
            Path to the video file if it exists, None otherwise
        """
        task = get_task(self.db, task_id=task_id, user_id=user_id)
        if not task or task.status != TaskStatus.COMPLETED or not task.result_data:
            return None
            
        video_path = task.result_data.get("video_path")
        if not video_path or not os.path.exists(video_path):
            return None
            
        return Path(video_path)
